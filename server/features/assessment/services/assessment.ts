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

export async function assessWithGemini(input: {
	systemInstruction: string;
	medicalCase: string;
	transcript: string;
}): Promise<Assessment> {
	const { systemInstruction, medicalCase, transcript } = input;

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) throw new Error("GEMINI_API_KEY missing");

	const { GoogleGenAI } = await import("@google/genai");
	const ai = new GoogleGenAI({ apiKey });

	const contents = [{ text: medicalCase }, { text: transcript }];

	const maxAttempts = 3;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const extraReminder =
			attempt === 1
				? ""
				: "\n\nReminder: Your previous output failed JSON Schema validation. Output MUST match the schema exactly. Do NOT add extra fields. Include all required fields even if empty/false.";

		const effectiveSystemInstruction = `${systemInstruction}${extraReminder}`;

		const response = await ai.models.generateContent({
			config: {
				systemInstruction: effectiveSystemInstruction,
				responseMimeType: "application/json",
				responseJsonSchema: AssessmentSchema,
			},
			contents,
			model: "gemini-2.5-pro",
		});

		// Safely extract JSON text from response without assertions
		const safeText = response.text ?? "{}";
		let parsedResponse: unknown = {};
		try {
			parsedResponse = JSON.parse(safeText);
		} catch (e) {
			console.warn("Failed to parse model JSON (attempt", attempt, ")");
		}

		const normalized = normalizeAssessment(parsedResponse);
		if (normalized && isAssessment(normalized)) {
			return normalized;
		}

		const preview = safeText.slice(0, 500);
		console.warn(
			`Assessment JSON failed validation (attempt ${attempt}/${maxAttempts}). Preview:`,
			preview,
		);

		if (attempt < maxAttempts) {
			await new Promise((r) => setTimeout(r, 300 + attempt * 200));
		}
	}

	throw new Error("Model returned invalid assessment JSON after retries");
}
