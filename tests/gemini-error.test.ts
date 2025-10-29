import request from "supertest";
import { vi, describe, it, expect, beforeAll } from "vitest";
import app from "../server/index";
import { medicalCases } from "../shared/cases";

beforeAll(() => {
	process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
});

// Mock Google GenAI to throw an @google/genai ApiError-like instance
vi.mock("@google/genai", () => {
	class ApiErrorLike extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.name = "ApiError";
			this.status = status;
		}
	}
	class GoogleGenAIMock {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		constructor(_: { apiKey: string }) {}
		models = {
			generateContent: async () => {
				throw new ApiErrorLike(
					"A schema in GenerationConfig in the request exceeds the maximum allowed nesting depth.",
					400,
				);
			},
		};
	}
	return { GoogleGenAI: GoogleGenAIMock };
});

// Avoid hitting ElevenLabs in tests
vi.mock("../server/features/assessment/services/assessment", async () => {
	const actual = await vi.importActual<
		typeof import("../server/features/assessment/services/assessment")
	>("../server/features/assessment/services/assessment");
	return {
		...actual,
		fetchTranscriptFromElevenLabs: vi
			.fn()
			.mockResolvedValue("User: Hello\nAgent: Hi"),
	};
});

describe("Gemini upstream error handling", () => {
	it("returns 502 with provider/name/status/message on ApiError failure", async () => {
		const medicalCase = medicalCases.find((c) => c.id === 1) ?? medicalCases[0];

		const res = await request(app)
			.post("/api/assessment")
			.set("Content-Type", "application/json")
			.send({ conversationId: "dummy", medicalCase });

		expect(res.status).toBe(502);
		expect(res.body.error).toBe("Upstream API error");
		expect(res.body.provider).toBe("google-genai");
		// Keys should exist even if any value is undefined
		expect(Object.prototype.hasOwnProperty.call(res.body, "name")).toBe(true);
		expect(Object.prototype.hasOwnProperty.call(res.body, "status")).toBe(true);
		expect(Object.prototype.hasOwnProperty.call(res.body, "message")).toBe(
			true,
		);
		// For our mock, we expect these concrete values
		expect(res.body.name).toBe("ApiError");
		expect(res.body.status).toBe(400);
		expect(typeof res.body.message).toBe("string");
	}, 20000);
});
