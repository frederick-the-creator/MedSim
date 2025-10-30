import coachSystem from "@shared/prompts/coachSystem";
import type { MedicalCase } from "@shared/schemas/case";

export async function buildCoachSystemInstruction(
	assessment: string,
	transcript: string,
	medicalCase: MedicalCase,
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
