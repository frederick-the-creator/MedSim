import { Request, Response, NextFunction } from "express";
import { buildCoachSystemInstruction } from "../services/coach";
import { parseCoachRequestBody } from "@server/shared/utils/validation";

export async function coachRoute(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	res.locals.context = "coach.stream";
	const body = parseCoachRequestBody(req.body);

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) throw new Error("GEMINI_API_KEY missing");

	const { GoogleGenAI } = await import("@google/genai");
	const ai = new GoogleGenAI({ apiKey });

	const systemInstruction = await buildCoachSystemInstruction(
		body.assessment ?? "",
		body.transcript ?? "",
		body.medicalCase,
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
}
