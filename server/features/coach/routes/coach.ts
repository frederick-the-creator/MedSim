import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { buildCoachSystemInstruction } from "../services/coach";

export async function coachRoute(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const bodySchema = z.object({
			messages: z
				.array(
					z.object({
						role: z.enum(["user", "assistant"]),
						content: z.string().max(8000),
					}),
				)
				.max(100),
			transcript: z.string().optional().default(""),
			assessment: z.string().optional().default(""),
		});

		const body = bodySchema.parse(req.body);

		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) throw new Error("GEMINI_API_KEY missing");

		const { GoogleGenAI } = await import("@google/genai");
		const ai = new GoogleGenAI({ apiKey });

		const systemInstruction = await buildCoachSystemInstruction(
			body.assessment ?? "",
			body.transcript ?? "",
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
	} catch (err) {
		next(err);
	}
}
