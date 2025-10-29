import coachPersona from "@prompts/coach_persona";

export async function buildCoachSystemInstruction(
	assessment: string,
	transcript: string,
): Promise<string> {
	return [
		coachPersona.trim(),
		"=== ASSESSMENT ===",
		assessment || "(none provided)",
		"=== TRANSCRIPT ===",
		transcript || "(none provided)",
	].join("\n\n");
}
