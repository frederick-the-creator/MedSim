import { Request, Response, NextFunction } from "express";
import { buildCoachSystemInstruction } from "../services/coach";
import { parseCoachRequestBody } from "@server/shared/utils/validation";
import { gemini } from "@server/shared/geminiClient";
import { generateContentStream } from "@server/features/coach/services/coach";

export async function coachRoute(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	res.locals.context = { op: "coach.stream" };

	// Route
	// - Validate body
	// - Call function to generate a response
	// - Set headers
	// - Stream response

	const reqBody = parseCoachRequestBody(req.body);

	const response = await generateContentStream(reqBody);

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
