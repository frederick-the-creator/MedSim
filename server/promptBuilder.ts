import fs from "fs/promises";
import path from "path";

let cachedPersona: string | null = null;

export async function buildCoachSystemInstruction(assessment: string, transcript: string): Promise<string> {
	if (!cachedPersona) {
		const personaPath = path.resolve(process.cwd(), "shared/prompts/coach_persona.txt");
		cachedPersona = await fs.readFile(personaPath, "utf8");
	}

	return [
		cachedPersona.trim(),
		"=== ASSESSMENT ===",
		assessment || "(none provided)",
		"=== TRANSCRIPT ===",
		transcript || "(none provided)",
	].join("\n\n");
}
