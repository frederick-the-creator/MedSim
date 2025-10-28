import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { buildCoachSystemInstruction } from "./promptBuilder";
import { Assessment, AssessmentSchema } from "@shared/schemas/assessment";

export async function registerRoutes(app: Express): Promise<Server> {
	// prefix all routes with /api

	app.post("/api/assessment", async (req, res, next) => {
		try {
			const { conversationId } = req.body as { conversationId?: string };
			if (!conversationId) {
				return res.status(400).json({ message: "conversationId required" });
			}

			const transcript = await fetchTranscriptFromElevenLabs(conversationId);

			if (!transcript || transcript.length === 0) {
				return res.status(409).json({ message: "Transcript not ready" });
			}

			const systemInstruction = await loadSystemPrompt();
			const assessment = await assessWithGemini({
				transcript,
				systemInstruction,
			});

			return res.json({ transcript, assessment });
		} catch (err) {
			next(err);
		}
	});

	// Chat streaming endpoint
	app.post("/api/chat", async (req, res, next) => {
		try {
			const bodySchema = z.object({
				messages: z
					.array(
						z.object({
							role: z.enum(["user", "assistant"]),
							content: z.string().max(8000),
						}),
					)
					.max(100),
				transcript: z.string().optional().default(""),
				assessment: z.string().optional().default(""),
			});

			const body = bodySchema.parse(req.body);

			const apiKey = process.env.GEMINI_API_KEY;
			if (!apiKey) throw new Error("GEMINI_API_KEY missing");

			const { GoogleGenAI } = await import("@google/genai");
			const ai = new GoogleGenAI({ apiKey });

			const systemInstruction = await buildCoachSystemInstruction(
				body.assessment ?? "",
				body.transcript ?? "",
			);

			type SimpleMsg = { role: "user" | "assistant"; content: string };
			const contents = body.messages.map((m: SimpleMsg) => ({
				role: m.role === "assistant" ? "model" : "user",
				parts: [{ text: m.content }],
			}));

			const response = await ai.models.generateContentStream({
				config: {
					systemInstruction,
				},
				contents,
				model: "gemini-2.0-flash",
			});

			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.setHeader("Transfer-Encoding", "chunked");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("X-Accel-Buffering", "no");

			for await (const chunk of response) {
				const text = chunk.text;
				if (text) {
					res.write(text);
				}
			}
			res.end();
		} catch (err) {
			next(err);
		}
	});

	const httpServer = createServer(app);
	return httpServer;
}

interface ElevenTranscriptItem {
	role: "user" | "agent" | string;
	message: string;
	time_in_call_secs?: number;
}

interface ElevenConversationResponse {
	conversation_id?: string;
	status?: string; // e.g., "initiated" | "in-progress" | "processing" | "done" | "failed"
	transcript?: ElevenTranscriptItem[] | string | null;
}

async function fetchTranscriptFromElevenLabs(
	conversationId: string,
): Promise<string> {
	const apiKey = process.env.ELEVENLABS_API_KEY;
	if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

	const url = `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}`;
	const resp = await fetch(url, {
		headers: {
			"xi-api-key": apiKey,
			"Content-Type": "application/json",
		},
	});
	if (!resp.ok) {
		throw new Error(`ElevenLabs error ${resp.status}: ${resp.statusText}`);
	}
	const json = (await resp.json()) as ElevenConversationResponse;

	// Ensure conversation has finished processing
	if (json.status && json.status !== "done") {
		return ""; // trigger 409 upstream
	}

	// Handle both array and string forms defensively
	if (Array.isArray(json.transcript)) {
		const lines = json.transcript.map((t) => {
			const who =
				t.role?.toLowerCase() === "agent"
					? "Agent"
					: t.role?.toLowerCase() === "user"
						? "User"
						: t.role || "Unknown";
			return `${who}: ${t.message ?? ""}`.trim();
		});
		return lines.join("\n");
	}

	if (typeof json.transcript === "string") {
		return json.transcript;
	}

	return "";
}

async function loadSystemPrompt(): Promise<string> {
	const promptPath = path.resolve(
		process.cwd(),
		"shared/prompts/assessment_system.txt",
	);
	return await fs.readFile(promptPath, "utf8");
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isAssessment(value: unknown): value is Assessment {
	if (!isNonNullObject(value)) return false;
	const v = value;
	const hasMaxTotal = typeof v.max_total === "number";
	const dims = v.dimensions;
	const hasDimensions = Array.isArray(dims);
	const totalsOk = isNonNullObject(v.totals);
	const feedbackOk = isNonNullObject(v.overall_feedback);
	return hasMaxTotal && hasDimensions && totalsOk && feedbackOk;
}

async function assessWithGemini(input: {
	transcript: string;
	systemInstruction: string;
}): Promise<Assessment> {
	const { transcript, systemInstruction } = input;
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) throw new Error("GEMINI_API_KEY missing");

	const { GoogleGenAI } = await import("@google/genai");
	const ai = new GoogleGenAI({ apiKey });

	const contents = [
		{
			role: "user",
			parts: [{ text: transcript }],
		},
	];
	const response = await ai.models.generateContent({
		config: {
			systemInstruction,
			responseMimeType: "application/json",
			responseJsonSchema: AssessmentSchema,
		},
		contents,
		model: "gemini-2.5-pro",
	});

	// Safely extract JSON text from response without assertions
	const safeText = response.text ?? "{}";
	const parsedResponse: unknown = JSON.parse(safeText);
	console.log("Parsed Response");
	console.log(parsedResponse);

	if (!isAssessment(parsedResponse)) {
		throw new Error("Model returned invalid assessment JSON");
	}

	return parsedResponse;
}
