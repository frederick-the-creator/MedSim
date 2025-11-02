import { Assessment, AssessmentSchema } from "@shared/schemas/assessment";
import { isAssessment } from "@server/shared/utils/validation";
import { normalizeAssessment } from "@server/shared/utils/assessmentNormalize";
import { logger } from "@server/middleware/httpLogger";

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
		return ""; // not ready yet
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

async function pollTranscriptWithBackoff(
	conversationId: string,
	cfg: { maxMs: number; baseMs: number; maxDelayMs: number },
): Promise<string> {
	const deadline = Date.now() + cfg.maxMs;
	let attempt = 0;
	let transcript = "";
	while (Date.now() < deadline) {
		logger.debug({ attempt, conversationId }, "transcript_poll_attempt");
		transcript = await getElevenTranscriptOnce(conversationId);

		if (transcript) break;
		const delay = Math.floor(
			Math.random() * Math.min(cfg.maxDelayMs, cfg.baseMs * 2 ** attempt),
		);
		if (delay > 0) {
			await new Promise((r) => setTimeout(r, delay));
		}
		attempt++;
	}
	return transcript; // "" if not ready within budget
}

export async function fetchTranscriptFromElevenLabs(
	conversationId: string,
): Promise<string> {
	const maxMs = Number(process.env.ASSESSMENT_POLL_MAX_MS ?? 10000);
	const baseMs = Number(process.env.ASSESSMENT_POLL_BASE_MS ?? 300);
	const maxDelayMs = Number(process.env.ASSESSMENT_POLL_MAX_DELAY_MS ?? 3000);
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

async function requestAssessmentJson(
	ai: GenAIClient,
	contents: { text: string }[],
	systemInstruction: string,
	model: string,
	schema: unknown,
): Promise<{ rawText: string; parsed: unknown }> {
	const response = await ai.models.generateContent({
		config: {
			systemInstruction,
			responseMimeType: "application/json",
			responseJsonSchema: schema,
		},
		contents,
		model,
	});

	// // Test Error handling by making this fail
	// const response = await ai.models.generateContent({
	// 	config: {
	// 		systemInstruction,
	// 		responseMimeType: "application/json",
	// 		responseJsonSchema: schema,
	// 	},
	// 	contents: [{ test: "test" }], // Test is not a valid property so should fail
	// 	model,
	// });

	// intentionally silent; caller may log via req.log if needed

	const safeText = response?.text ?? "{}";
	let parsed: unknown = {};
	try {
		parsed = JSON.parse(safeText);
	} catch {
		// swallow parse error; caller handles validation failures
	}
	return { rawText: safeText, parsed };
}

function validateAndNormalizeAssessment(candidate: unknown): Assessment | null {
	const normalized = normalizeAssessment(candidate);
	if (normalized && isAssessment(normalized)) return normalized;
	return null;
}

async function generateAssessmentWithRetries(
	ai: GenAIClient,
	contents: { text: string }[],
	baseSystemInstruction: string,
	schema: unknown,
	model: string,
	cfg: Partial<GeminiRetryConfig> = {},
): Promise<Assessment> {
	const { maxAttempts, initialDelayMs, delayIncrementMs } = {
		maxAttempts: 3,
		initialDelayMs: 300,
		delayIncrementMs: 200,
		...cfg,
	};

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		logger.debug({ attempt }, "assessment_generation_attempt");
		const effectiveSystemInstruction = buildEffectiveSystemInstruction(
			baseSystemInstruction,
			attempt,
		);

		const { rawText, parsed } = await requestAssessmentJson(
			ai,
			contents,
			effectiveSystemInstruction,
			model,
			schema,
		);

		const validated = validateAndNormalizeAssessment(parsed);
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
		"gemini-2.5-pro",
		{ maxAttempts: 3, initialDelayMs: 300, delayIncrementMs: 200 },
	);
}
