import { z } from "zod";
import { medicalCaseSchema } from "@shared/schemas/case";
import { coachRequestSchema } from "@shared/schemas/coach";

export const assessmentRequestSchema = z.object({
	conversationId: z.string().min(1),
	medicalCase: medicalCaseSchema,
});

export type AssessmentRequestBody = z.infer<typeof assessmentRequestSchema>;

export function parseAssessmentRequestBody(
	body: unknown,
): AssessmentRequestBody {
	return assessmentRequestSchema.parse(body);
}

export type CoachRequestBody = z.infer<typeof coachRequestSchema>;

export function parseCoachRequestBody(body: unknown): CoachRequestBody {
	return coachRequestSchema.parse(body);
}
