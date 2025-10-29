import { Assessment, AssessmentSchema } from "@shared/schemas/assessment";
import { isAssessment } from "@server/shared/utils/validation";
import { normalizeAssessment } from "@server/shared/utils/assessmentNormalize";

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
		console.log("Pollint Transcript");
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

		const preview = rawText.slice(0, 500);
		console.warn(
			`Assessment JSON failed validation (attempt ${attempt}/${maxAttempts}). Preview:`,
			preview,
		);

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
		console.error("❌ No GOOGLE_API_KEY found in environment!");
	} else {
		const keyPreview = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;
		console.log(`Using Google API key: ${keyPreview}`);
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
