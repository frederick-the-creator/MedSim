import { z } from "zod";
import { medicalCaseSchema } from "@shared/schemas/case";

export const coachMessageSchema = z.object({
	id: z.string(),
	role: z.enum(["user", "assistant"]),
	content: z.string().max(8000),
	timestamp: z.coerce.date(),
});

export type CoachMessage = z.infer<typeof coachMessageSchema>;

export const coachRequestSchema = z.object({
	// conversationId: z.string(),
	messages: z.array(coachMessageSchema).max(100),
	transcript: z.string(),
	assessment: z.string(),
	medicalCase: medicalCaseSchema,
});

export type CoachRequestBody = z.infer<typeof coachRequestSchema>;
