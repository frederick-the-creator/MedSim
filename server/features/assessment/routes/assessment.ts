import assessmentSystem from "@prompts/assessment_system";
import { MedicalCase } from "@shared/schema";
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
	const { conversationId, medicalCase } = req.body as {
		conversationId?: string;
		medicalCase?: MedicalCase;
	};

	if (!conversationId) {
		res.status(400).json({ message: "conversationId required" });
		return;
	}

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
