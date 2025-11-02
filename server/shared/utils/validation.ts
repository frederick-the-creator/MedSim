import { z } from "zod";
import { medicalCaseSchema } from "@shared/schemas/case";
import { coachRequestSchema } from "@shared/schemas/coach";
import type { Assessment } from "@shared/schemas/assessment";
import { dimensionNames, dimensionKeys } from "@shared/schemas/assessment";

// Zod Validation for assessment route
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

// Zod validation for coach route
export type CoachRequestBody = z.infer<typeof coachRequestSchema>;

export function parseCoachRequestBody(body: unknown): CoachRequestBody {
	return coachRequestSchema.parse(body);
}

// Type guard for assessment object returned by Gemini

function isNonNullObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isPointsArray(value: unknown): boolean {
	if (!Array.isArray(value)) return false;
	if (value.length > 3) return false;
	return value.every(
		(p) =>
			isNonNullObject(p) &&
			((p as any).strength_improvement === "strength" ||
				(p as any).strength_improvement === "improvement") &&
			typeof (p as any).detail === "string",
	);
}

function isDimension(value: unknown): boolean {
	if (!isNonNullObject(value)) return false;
	const points = (value as any).points;
	const insufficient = (value as any).insufficient_evidence;
	const redFlags = (value as any).red_flags;
	return (
		isPointsArray(points) &&
		typeof insufficient === "boolean" &&
		Array.isArray(redFlags) &&
		redFlags.every((x) => typeof x === "string")
	);
}

export function isAssessment(value: unknown): value is Assessment {
	console.log("Assessment input to isAssessment");
	console.dir(value, { depth: null });

	// Check overall object not null
	if (!isNonNullObject(value)) return false;

	// Check dimensions not null
	const dims = (value as any).dimensions;
	if (!isNonNullObject(dims)) return false;

	// Check dimension keys
	const dimKeys = Object.keys(dims);
	if (dimKeys.length !== dimensionKeys.length) return false; // Expect 5 dimensions

	for (const key of dimensionKeys) {
		// Expect specific naming of dimensions
		if (!Object.prototype.hasOwnProperty.call(dims, key)) return false;
	}

	// Check contents of each dimension
	const dimsOk = dimensionKeys.every((k) => isDimension((dims as any)[k]));

	const summary = (value as any).summary;
	const summaryOk =
		isNonNullObject(summary) &&
		typeof (summary as any).free_text === "string" &&
		Array.isArray((summary as any).bullet_points) &&
		(summary as any).bullet_points.length <= 3 &&
		(summary as any).bullet_points.every((x: unknown) => typeof x === "string");
	return dimsOk && summaryOk;
}
