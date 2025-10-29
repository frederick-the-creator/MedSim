import assessmentSystem from "@prompts/assessment_system";
import { parseAssessmentRequestBody } from "@server/shared/utils/validation";
import {
	fetchTranscriptFromElevenLabs,
	assessWithGemini,
} from "../services/assessment";
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

	res.json({ transcript, assessment });
	return;
}
