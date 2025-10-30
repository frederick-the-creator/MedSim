import coachPersona from "@prompts/coach_persona";
import type { MedicalCase } from "@shared/schemas/case";

export async function buildCoachSystemInstruction(
	assessment: string,
	transcript: string,
	medicalCase?: MedicalCase,
): Promise<string> {
	return [
		coachPersona.trim(),
		"=== CASE CONTEXT ===",
		medicalCase ? JSON.stringify(medicalCase, null, 2) : "(none provided)",
		"=== ASSESSMENT ===",
		assessment || "(none provided)",
		"=== TRANSCRIPT ===",
		transcript || "(none provided)",
	].join("\n\n");
}
