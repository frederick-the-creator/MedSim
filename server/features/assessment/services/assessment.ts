import { Assessment, AssessmentSchema } from "@shared/schemas/assessment";
import { isAssessment } from "@server/shared/utils/validation";

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
