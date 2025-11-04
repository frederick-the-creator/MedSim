import coachSystem from "@shared/prompts/coachSystem";
import type { MedicalCase } from "@shared/schemas/case";
import type { CoachRequestBody } from "@shared/schemas/coach";
import { gemini } from "@server/shared/geminiClient";
import type { GenerateContentResponse } from "@google/genai";

export async function buildCoachSystemInstruction(
	medicalCase: MedicalCase,
	transcript: string,
	assessment: string,
): Promise<string> {
	return [
		coachSystem.trim(),
		"=== CASE CONTEXT ===",
		JSON.stringify(medicalCase, null, 2),
		"=== ASSESSMENT ===",
		assessment,
		"=== TRANSCRIPT ===",
		transcript,
	].join("\n\n");
}

type SimpleMsg = { role: "user" | "assistant"; content: string };

export async function generateContentStream(
	reqBody: CoachRequestBody,
): Promise<AsyncGenerator<GenerateContentResponse>> {
	const { messages, medicalCase, transcript, assessment } = reqBody; // Add conversation ID later

	const systemInstruction = await buildCoachSystemInstruction(
		medicalCase,
		transcript,
		assessment,
	);

	const contents = messages.map((m: SimpleMsg) => ({
		role: m.role === "assistant" ? "model" : "user",
		parts: [{ text: m.content }],
	}));

	const response = gemini.models.generateContentStream({
		config: {
			systemInstruction,
		},
		contents,
		model: "gemini-2.5-flash-lite",
	});

	return response;
}
