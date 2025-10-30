import assessmentSystem from "@prompts/assessment_system";
import { parseAssessmentRequestBody } from "@server/shared/utils/validation";
import {
	fetchTranscriptFromElevenLabs,
	assessWithGemini,
} from "../services/assessment";
import { isAssessment } from "@server/shared/utils/validation";
import { Request, Response, NextFunction } from "express";

export async function assessmentRoute(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	res.locals.context = "assessment.generate";
	const { conversationId, medicalCase } = parseAssessmentRequestBody(req.body);

	const transcript = await fetchTranscriptFromElevenLabs(conversationId);

	if (!transcript || transcript.length === 0) {
		const maxDelayMs = Number(process.env.ASSESSMENT_POLL_MAX_DELAY_MS ?? 3000);
		const retryAfterSecs = Math.ceil(Math.min(maxDelayMs, 3000) / 1000);
		res.setHeader("Retry-After", String(retryAfterSecs));
		res.status(409).json({ message: "Transcript not ready" });
		return;
	}

	const medicalCaseString = JSON.stringify(medicalCase);
	const systemInstruction = assessmentSystem;
	const assessment = await assessWithGemini({
		systemInstruction,
		medicalCase: medicalCaseString,
		transcript,
	});

	if (!assessment || !isAssessment(assessment)) {
		res.status(502).json({ message: "Assessment generation failed" });
		return;
	}

	res.json({ transcript, assessment });
	return;
}
