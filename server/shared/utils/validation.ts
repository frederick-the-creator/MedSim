import { z } from "zod";
import { medicalCaseSchema } from "@shared/schemas/case";
import { coachRequestSchema } from "@shared/schemas/coach";
import type { Assessment } from "@shared/schemas/assessment";
import { DIMENSION_KEYS } from "@shared/schemas/assessment";

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

function isNonNullObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isPointsArray(value: unknown): boolean {
	if (!Array.isArray(value)) return false;
	if (value.length > 3) return false;
	return value.every(
		(p) =>
			isNonNullObject(p) &&
			((p as any).type === "strength" || (p as any).type === "improvement") &&
			typeof (p as any).text === "string",
	);
}

const DIMENSION_NAMES: readonly string[] = [
	"Rapport, introduction, structure and flow",
	"Empathy, listening and patient perspective",
	"Medical explanation and plan",
	"Honesty and transparency",
	"Appropriate pace",
];

function isDimension(value: unknown): boolean {
	if (!isNonNullObject(value)) return false;
	const name = (value as any).name;
	const points = (value as any).points;
	const insufficient = (value as any).insufficient_evidence;
	const redFlags = (value as any).red_flags;
	return (
		typeof name === "string" &&
		DIMENSION_NAMES.includes(name) &&
		isPointsArray(points) &&
		typeof insufficient === "boolean" &&
		Array.isArray(redFlags) &&
		redFlags.every((x) => typeof x === "string")
	);
}

export function isAssessment(value: unknown): value is Assessment {
	if (!isNonNullObject(value)) return false;
	const dims = (value as any).dimensions;
	const summary = (value as any).summary;
	if (!isNonNullObject(dims)) return false;
	const dimKeys = Object.keys(dims);
	if (dimKeys.length !== DIMENSION_KEYS.length) return false;
	for (const key of DIMENSION_KEYS) {
		if (!Object.prototype.hasOwnProperty.call(dims, key)) return false;
	}
	const dimsOk = DIMENSION_KEYS.every((k) => isDimension((dims as any)[k]));
	const summaryOk =
		isNonNullObject(summary) &&
		typeof (summary as any).free_text === "string" &&
		Array.isArray((summary as any).bullet_points) &&
		(summary as any).bullet_points.length <= 3 &&
		(summary as any).bullet_points.every((x: unknown) => typeof x === "string");
	return dimsOk && summaryOk;
}
