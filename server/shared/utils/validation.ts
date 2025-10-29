import { z } from "zod";
import { medicalCaseSchema } from "@shared/schema";

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
