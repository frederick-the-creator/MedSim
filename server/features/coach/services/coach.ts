import coachSystem from "@shared/prompts/coachSystem";
import type { MedicalCase } from "@shared/schemas/case";
import type { CoachRequestBody } from "@shared/schemas/coach";
import { gemini } from "@server/shared/geminiClient";
import type { GenerateContentResponse } from "@google/genai";
import type { CoachMessage } from "@shared/schemas/coach";
import { upsertCoachData } from "@server/features/coach/repos/coach";
import type { Logger } from "pino";
import { Json } from "drizzle-zod";

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

export async function generateContentStream({
	medicalCase,
	transcript,
	assessment,
	messages,
}: CoachRequestBody): Promise<AsyncGenerator<GenerateContentResponse>> {
	const systemInstruction = await buildCoachSystemInstruction(
		medicalCase,
		transcript,
		assessment,
	);

	const contents = messages.map((m: SimpleMsg) => ({
		role: m.role === "assistant" ? "model" : "user",
		parts: [{ text: m.content }],
	}));

	const response = await gemini.models.generateContentStream({
		config: {
			systemInstruction,
		},
		contents,
		model: "gemini-2.5-flash-lite",
	});

	return response;
}

type SaveConverstation = {
	conversationId: string;
	priorMessages: CoachMessage[];
	assistantText: string;
};

export async function saveCoachConversation(
	input: SaveConverstation,
	logger?: Logger,
): Promise<void> {
	const { conversationId, priorMessages, assistantText } = input;

	if (!assistantText) return;

	const assistantMsg: CoachMessage = {
		id: `assistant-${Date.now()}`,
		role: "assistant",
		content: assistantText,
		timestamp: new Date(),
	};

	const allMessages = [...priorMessages, assistantMsg];

	try {
		await upsertCoachData({
			conversationId,
			messages: allMessages as Json,
		});
	} catch (err) {
		logger?.error({ err }, "coach_upsert_failed");
	}
}
