import { z } from "zod";

// 1) Literal names for the five fixed dimensions
export type DimensionName =
	| "Rapport, introduction, structure and flow"
	| "Empathy, listening and patient perspective"
	| "Medical explanation and plan"
	| "Honesty and transparency"
	| "Appropriate pace and non-verbal skills";

// 2) Single dimension shape
export interface Dimension {
	name: DimensionName;
	raw_score_0_to_100: number;
	weighted_score: number;
	evidence: string[];
	strengths: string[];
	improvements: string[];
	insufficient_evidence: boolean;
	red_flags: string[];
}

// 3) Full assessment (note: no station_title; max_total fixed at 50)
export interface Assessment {
	max_total: 49.8;
	dimensions: [
		Dimension & { name: "Rapport, introduction, structure and flow" },
		Dimension & { name: "Empathy, listening and patient perspective" },
		Dimension & { name: "Medical explanation and plan" },
		Dimension & { name: "Honesty and transparency" },
		Dimension & { name: "Appropriate pace and non-verbal skills" },
	];
	totals: {
		total_score: number;
		percentage: number;
	};
	overall_feedback: {
		summary: string;
		keep_doing: string[];
		priorities_for_next_time: string[];
	};
}

// 4) JSON Schema Gemini will enforce at runtime
export const AssessmentSchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		max_total: { type: "number", enum: [49.8] },

		dimensions: {
			type: "array",
			minItems: 5,
			maxItems: 5,
			// prefixItems enforces positionally the five required dimensions
			prefixItems: [
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							enum: ["Rapport, introduction, structure and flow"],
						},
						raw_score_0_to_100: { type: "number", minimum: 0, maximum: 100 },
						weighted_score: { type: "number", minimum: 0, maximum: 13.3 },
						evidence: { type: "array", items: { type: "string" } },
						strengths: { type: "array", items: { type: "string" } },
						improvements: { type: "array", items: { type: "string" } },
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: [
						"name",
						"raw_score_0_to_100",
						"weighted_score",
						"evidence",
						"strengths",
						"improvements",
						"insufficient_evidence",
						"red_flags",
					],
				},
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							enum: ["Empathy, listening and patient perspective"],
						},
						raw_score_0_to_100: { type: "number", minimum: 0, maximum: 100 },
						weighted_score: { type: "number", minimum: 0, maximum: 13.3 },
						evidence: { type: "array", items: { type: "string" } },
						strengths: { type: "array", items: { type: "string" } },
						improvements: { type: "array", items: { type: "string" } },
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: [
						"name",
						"raw_score_0_to_100",
						"weighted_score",
						"evidence",
						"strengths",
						"improvements",
						"insufficient_evidence",
						"red_flags",
					],
				},
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: { type: "string", enum: ["Medical explanation and plan"] },
						raw_score_0_to_100: { type: "number", minimum: 0, maximum: 100 },
						weighted_score: { type: "number", minimum: 0, maximum: 9.96 },
						evidence: { type: "array", items: { type: "string" } },
						strengths: { type: "array", items: { type: "string" } },
						improvements: { type: "array", items: { type: "string" } },
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: [
						"name",
						"raw_score_0_to_100",
						"weighted_score",
						"evidence",
						"strengths",
						"improvements",
						"insufficient_evidence",
						"red_flags",
					],
				},
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: { type: "string", enum: ["Honesty and transparency"] },
						raw_score_0_to_100: { type: "number", minimum: 0, maximum: 100 },
						weighted_score: { type: "number", minimum: 0, maximum: 3.32 },
						evidence: { type: "array", items: { type: "string" } },
						strengths: { type: "array", items: { type: "string" } },
						improvements: { type: "array", items: { type: "string" } },
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: [
						"name",
						"raw_score_0_to_100",
						"weighted_score",
						"evidence",
						"strengths",
						"improvements",
						"insufficient_evidence",
						"red_flags",
					],
				},
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							enum: ["Appropriate pace and non-verbal skills"],
						},
						raw_score_0_to_100: { type: "number", minimum: 0, maximum: 100 },
						weighted_score: { type: "number", minimum: 0, maximum: 9.96 },
						evidence: { type: "array", items: { type: "string" } },
						strengths: { type: "array", items: { type: "string" } },
						improvements: { type: "array", items: { type: "string" } },
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: [
						"name",
						"raw_score_0_to_100",
						"weighted_score",
						"evidence",
						"strengths",
						"improvements",
						"insufficient_evidence",
						"red_flags",
					],
				},
			],
		},

		totals: {
			type: "object",
			additionalProperties: false,
			properties: {
				total_score: { type: "number" },
				percentage: { type: "number" },
			},
			required: ["total_score", "percentage"],
		},

		overall_feedback: {
			type: "object",
			additionalProperties: false,
			properties: {
				summary: { type: "string" },
				keep_doing: { type: "array", items: { type: "string" } },
				priorities_for_next_time: { type: "array", items: { type: "string" } },
			},
			required: ["summary", "keep_doing", "priorities_for_next_time"],
		},
	},
	required: ["max_total", "dimensions", "totals", "overall_feedback"],
} as const;

// API schema for running an assessment
export const runAssessmentSchemaAPI = z.object({
	body: z.object({
		roomUrl: z.string(),
		roomId: z.string(),
		roundId: z.string(),
		caseName: z.string(),
	}),
});

export type RunAssessmentBody = z.infer<typeof runAssessmentSchemaAPI>["body"];
