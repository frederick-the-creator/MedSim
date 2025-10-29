import request from "supertest";
import { vi, describe, it, expect, beforeAll } from "vitest";
import app from "../server/index";
import { medicalCases } from "../shared/cases";

beforeAll(() => {
	process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
});

// Mock Google GenAI to throw an ApiError-shaped object
vi.mock("@google/genai", () => {
	class GoogleGenAIMock {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		constructor(_: { apiKey: string }) {}
		models = {
			generateContent: async () => {
				const err: any = new Error("ApiError");
				err.name = "ApiError";
				err.error = {
					code: 400,
					status: "INVALID_ARGUMENT",
					message:
						"A schema in GenerationConfig in the request exceeds the maximum allowed nesting depth.",
				};
				throw err;
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
	it("returns 502 with provider/code/status/message on Gemini failure", async () => {
		const medicalCase = medicalCases.find((c) => c.id === 1) ?? medicalCases[0];

		const res = await request(app)
			.post("/api/assessment")
			.set("Content-Type", "application/json")
			.send({ conversationId: "dummy", medicalCase });

		expect(res.status).toBe(502);
		expect(res.body).toMatchObject({
			error: "Upstream API error",
			provider: "google-genai",
			code: 400,
			status: "INVALID_ARGUMENT",
		});
		expect(typeof res.body.message).toBe("string");
	}, 20000);
});
