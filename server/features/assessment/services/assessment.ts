import { Assessment, AssessmentSchema } from "@shared/schemas/assessment";
import { isAssessment } from "@server/shared/utils/validation";
import { logger } from "@server/middleware/httpLogger";
import { DomainError } from "@server/shared/errors";
import type { ApiError } from "@google/genai";

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

async function getElevenTranscriptOnce(
	conversationId: string,
): Promise<string | undefined> {
	// Function returns an empty string in following cases:
	// -- Elevenlabs Transcript Job is not complete -> If run out of polling time will return a string to gemini assessment
	// -- Elevenlabs Trancsript object is not conforming to array or string (assumption made that when status = done, the transcript is array or string... other options include null / undefined but assumption that this is only case when status != done)

	// New pattern - Transcript should be undefined unless status = done

	const apiKey = process.env.ELEVENLABS_API_KEY;
	if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");

	const url = `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}`;
	const resp = await fetch(url, {
		headers: {
			"xi-api-key": apiKey,
			"Content-Type": "application/json",
		},
	});

	// Response is ok even if transcript is not ready

	if (!resp.ok) {
		throw new Error(`ElevenLabs error ${resp.status}: ${resp.statusText}`);
	}

	const json = (await resp.json()) as ElevenConversationResponse;

	// logger.info(json);

	// Ensure conversation has finished processing
	if (json.status && json.status !== "done") {
		return undefined; // not ready yet
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

	throw new Error("Transcript job finished but transcript type is invalid");
}

async function pollTranscriptWithBackoff(
	conversationId: string,
	cfg: {
		maxMs: number; // Max total time budget to spend polling
		baseMs: number; // Minimum delay between polls
		maxDelayMs: number; // Max delay between polls
	},
): Promise<string> {
	const deadline = Date.now() + cfg.maxMs;
	let attempt = 0;
	let transcript: string | undefined = "";
	while (Date.now() < deadline) {
		const delay = Math.floor(
			// 2 * attempt means we spend more time waiting with each attempt
			Math.random() * Math.min(cfg.maxDelayMs, cfg.baseMs * 2 ** attempt),
		);

		logger.info(
			{ attempt, conversationId, delayMs: delay },
			"transcript_poll_attempt",
		);

		transcript = await getElevenTranscriptOnce(conversationId);
		if (transcript) return transcript;

		if (delay > 0) {
			// Create pause for the length of the delay
			await new Promise((r) => setTimeout(r, delay));
		}
		attempt++;
	}

	throw new DomainError("transcript_not_ready", "Transcript not ready", 422);
}

export async function fetchTranscriptFromElevenLabs(
	conversationId: string,
): Promise<string> {
	const maxMs = Number(process.env.TRANSCRIPT_POLL_MAX_MS ?? 60 * 1000); // Budget of 60 seconds
	const baseMs = Number(process.env.TRANSCRIPT_POLL_BASE_MS ?? 300);
	const maxDelayMs = Number(
		process.env.TRANSCRIPT_POLL_MAX_DELAY_MS ?? 3 * 1000,
	); // Wait a maximum of 3 seconds for each poll
	return pollTranscriptWithBackoff(conversationId, {
		maxMs,
		baseMs,
		maxDelayMs,
	});
}

// removed file I/O prompt loader; using module import instead

// --- Gemini assessment helpers (single-attempt request, validation, retries) ---

type GenAIClient = {
	models: {
		generateContent: (args: any) => Promise<{
			text?: string;
		}>;
	};
};

interface GeminiRetryConfig {
	maxAttempts: number;
	initialDelayMs: number;
	delayIncrementMs: number;
}

function buildEffectiveSystemInstruction(
	base: string,
	attempt: number,
): string {
	return attempt === 1
		? base
		: `${base}\n\nReminder: Your previous output failed JSON Schema validation. Output MUST match the schema exactly. Do NOT add extra fields. Include all required fields even if empty/false.`;
}

function isTransientGeminiError(err: ApiError): boolean {
	const s = err.status;
	return s === 429 || (s >= 500 && s <= 599);
}

async function generateContentWithTransientRetries(
	ai: GenAIClient,
	args: any,
	cfg: {
		maxAttempts: number;
		baseMs: number;
		maxDelayMs?: number;
		jitterMs?: number;
	} = {
		maxAttempts: 10,
		baseMs: 400,
		maxDelayMs: 2000,
		jitterMs: 120,
	},
) {
	for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
		try {
			return await ai.models.generateContent(args);
		} catch (e) {
			const err = e as ApiError;
			if (attempt >= cfg.maxAttempts || !isTransientGeminiError(err)) throw err;
			logger.info("Transient Gemini Error - Retrying");
			const exp = Math.min(
				cfg.baseMs * 2 ** (attempt - 1),
				cfg.maxDelayMs ?? Number.POSITIVE_INFINITY,
			);
			const jitter = Math.floor(Math.random() * (cfg.jitterMs ?? 0));
			await new Promise((r) => setTimeout(r, exp + jitter));
		}
	}

	throw new Error("Gemini generate assessment retry loop exhausted");
}

async function requestAssessmentJson(
	ai: GenAIClient,
	contents: { text: string }[],
	systemInstruction: string,
	model: string,
	schema: unknown,
): Promise<{ rawText: string; parsed: unknown }> {
	// console.log("contents");
	// console.dir(contents, { depth: null });
	// console.log("systemInstruction");
	// console.dir(systemInstruction, { depth: null });
	// console.log("schema");
	// console.dir(schema, { depth: null });

	const response = await generateContentWithTransientRetries(ai, {
		config: {
			systemInstruction,
			responseMimeType: "application/json",
			responseJsonSchema: schema,
		},
		contents,
		model,
	});

	const safeText = response?.text ?? "{}";
	let parsed: unknown = {};
	try {
		parsed = JSON.parse(safeText);
	} catch {
		// swallow parse error; caller handles validation failures
	}
	return { rawText: safeText, parsed };
}

function validateAssessment(candidate: unknown): Assessment | null {
	if (isAssessment(candidate)) return candidate;
	return null;
}

async function generateAssessmentWithRetries(
	ai: GenAIClient,
	contents: { text: string }[],
	baseSystemInstruction: string,
	schema: unknown,
	cfg: Partial<GeminiRetryConfig> = {},
): Promise<Assessment> {
	const { maxAttempts, initialDelayMs, delayIncrementMs } = {
		maxAttempts: 3,
		initialDelayMs: 300,
		delayIncrementMs: 200,
		...cfg,
	};

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		logger.info({ attempt }, "assessment_generation_attempt");
		const effectiveSystemInstruction = buildEffectiveSystemInstruction(
			baseSystemInstruction,
			attempt,
		);

		const { rawText, parsed } = await requestAssessmentJson(
			ai,
			contents,
			effectiveSystemInstruction,
			"gemini-2.5-flash-lite",
			schema,
		);

		const validated = validateAssessment(parsed);
		if (validated) return validated;

		// leave logging to caller and middleware; avoid console noise in services

		if (attempt < maxAttempts) {
			await new Promise((r) =>
				setTimeout(r, initialDelayMs + attempt * delayIncrementMs),
			);
		}
	}

	throw new Error("Model returned invalid assessment JSON after retries");
}

export async function assessWithGemini(input: {
	systemInstruction: string;
	medicalCase: string;
	transcript: string;
}): Promise<Assessment> {
	const { systemInstruction, medicalCase, transcript } = input;

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		// allow error paths to be normalized centrally; do not console.log
	}

	const { GoogleGenAI } = await import("@google/genai");
	const ai = new GoogleGenAI({ apiKey }) as unknown as GenAIClient;
	const contents = [{ text: medicalCase }, { text: transcript }];

	return generateAssessmentWithRetries(
		ai,
		contents,
		systemInstruction,
		AssessmentSchema,
		{ maxAttempts: 3, initialDelayMs: 300, delayIncrementMs: 200 },
	);
}
