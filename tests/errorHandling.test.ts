import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { medicalCases } from "../shared/cases";

// Mock services BEFORE importing the app so route bindings pick up mocks
vi.mock("../server/features/assessment/services/assessment", () => {
	return {
		fetchTranscriptFromElevenLabs: vi.fn(),
		assessWithGemini: vi.fn(),
	};
});

async function getApp() {
	const mod = await import("../server/index");
	return mod.default;
}

describe("Error handling and logging middleware", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns 400 with issues and requestId for Zod validation errors", async () => {
		const app = await getApp();
		const res = await request(app).post("/api/assessment").send({});
		expect(res.status).toBe(400);
		expect(res.body?.error).toBe("Invalid input");
		expect(Array.isArray(res.body?.issues)).toBe(true);
		expect(typeof res.body?.requestId === "string").toBe(true);
		// header is set by httpLogger
		expect(typeof res.headers["x-request-id"] === "string").toBe(true);
	});

	it("returns 500 with requestId for unknown errors", async () => {
		// Bypass Zod with a valid payload and force an unknown downstream error
		const svc = await import(
			"../server/features/assessment/services/assessment"
		);
		(
			svc.fetchTranscriptFromElevenLabs as unknown as {
				mockRejectedValueOnce: (e: unknown) => void;
			}
		).mockRejectedValueOnce(new Error("boom"));

		const app = await getApp();
		const conversationId = "conv_test_unknown";
		const medicalCase = medicalCases[0];

		const res = await request(app)
			.post("/api/assessment")
			.send({ conversationId, medicalCase });
		expect(res.status).toBe(500);
		expect(res.body?.error).toBe("Internal Server Error");
		expect(typeof res.body?.requestId === "string").toBe(true);
	});

	it("returns 502 for generic upstream failures (e.g., ElevenLabs)", async () => {
		// Make the upstream call throw a recognizable error
		const svc = await import(
			"../server/features/assessment/services/assessment"
		);
		(
			svc.fetchTranscriptFromElevenLabs as unknown as {
				mockRejectedValueOnce: (e: unknown) => void;
			}
		).mockRejectedValueOnce(
			new Error("ElevenLabs error 429: Too Many Requests"),
		);

		const app = await getApp();
		const conversationId = "conv_test_eleven";
		const medicalCase = medicalCases[0];

		const res = await request(app)
			.post("/api/assessment")
			.send({ conversationId, medicalCase });
		expect(res.status).toBe(502);
		expect(res.body?.error).toBe("Upstream API error");
		expect(res.body?.provider).toBe("elevenlabs");
		expect(res.body?.status).toBe(429);
		expect(typeof res.body?.reqId === "string").toBe(true);
	});
});
