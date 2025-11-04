import { Request, Response } from "express";
import { saveCoachConversation } from "../services/coach";
import { parseCoachRequestBody } from "@server/shared/utils/validation";
import { generateCoachResponse } from "@server/features/coach/services/coach";

export async function coachRoute(req: Request, res: Response): Promise<void> {
	res.locals.context = { op: "coach.stream", provider: "google-genai" };

	const body = parseCoachRequestBody(req.body);

	res.locals.context.step = "generate";
	const response = await generateCoachResponse({
		messages: body.messages,
		transcript: body.transcript,
		assessment: body.assessment,
		medicalCase: body.medicalCase,
	});

	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.setHeader("Transfer-Encoding", "chunked");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("X-Accel-Buffering", "no");

	let acc = "";
	for await (const chunk of response) {
		const text = chunk.text;
		if (text) {
			res.write(text);
			acc += text;
		}
	}

	res.locals.context.step = "save";
	await saveCoachConversation({
		conversationId: "TEST-COACH",
		priorMessages: body.messages,
		assistantText: acc.trim(),
	});
	res.end();
}
