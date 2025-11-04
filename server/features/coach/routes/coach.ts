import { Request, Response, NextFunction } from "express";
import {
	buildCoachSystemInstruction,
	saveCoachConversation,
} from "../services/coach";
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

	const body = parseCoachRequestBody(req.body);

	// TODO
	// - Refine to add child logger like in save Coach
	// - Rename service (generateCoachResponse)

	const response = await generateContentStream({
		medicalCase: body.medicalCase,
		transcript: body.transcript,
		assessment: body.assessment,
		messages: body.messages,
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
	res.end();

	void saveCoachConversation(
		{
			conversationId: "TEST-COACH",
			priorMessages: body.messages,
			assistantText: acc.trim(),
		},
		req.log.child({ op: "coach.save" }), // Create request scoped child logger - Any logs used in the service inherits reqId and operation tag for traceability
	);
}
