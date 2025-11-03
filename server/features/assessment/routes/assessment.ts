import assessmentSystem from "@shared/prompts/assessmentSystem";
import { parseAssessmentRequestBody } from "@server/shared/utils/validation";
import {
	fetchTranscriptFromElevenLabs,
	assessWithGemini,
} from "../services/assessment";
import { isAssessment } from "@server/shared/utils/validation";
import { Request, Response, NextFunction } from "express";
import { insertAssessmentData } from "@server/features/assessment/repos/assessment";

export async function assessmentRoute(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const { conversationId, medicalCase } = parseAssessmentRequestBody(req.body);
	res.locals.context = {
		op: "assessment.generate",
		conversationId,
		provider: "elevenlabs_and_gemini",
	};

	const transcript = await fetchTranscriptFromElevenLabs(conversationId);

	req.log.info("Transcript successfully retrieved");

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

	const reqId = req.id as string;

	await insertAssessmentData({
		reqId,
		conversationId,
		medicalCase,
		transcript,
		assessment: JSON.stringify(assessment),
	});

	req.log.info("Assessment successfully retrieved");
	res.json({ transcript, assessment });
	return;
}
