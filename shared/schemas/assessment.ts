import { z } from "zod";

// 1) Literal names for the five fixed dimensions (order enforced below)
export type DimensionName =
	| "Rapport, introduction, structure and flow"
	| "Empathy, listening and patient perspective"
	| "Medical explanation and plan"
	| "Honesty and transparency"
	| "Appropriate pace";

// 2) Qualitative point — each either a strength or improvement, with inline quotes
export type PointType = "strength" | "improvement";

export interface Point {
	type: PointType;
	text: string; // should include direct quotes from the transcript
}

// 3) Single dimension (purely qualitative)
export interface Dimension {
	name: DimensionName;
	points: Point[]; // 0–3 items, each is strength or improvement
	insufficient_evidence: boolean;
	red_flags: string[]; // e.g. unsafe advice, misinformation, etc.
}

// 4) Full assessment (no totals or scores)
export interface Assessment {
	dimensions: [
		Dimension & { name: "Rapport, introduction, structure and flow" },
		Dimension & { name: "Empathy, listening and patient perspective" },
		Dimension & { name: "Medical explanation and plan" },
		Dimension & { name: "Honesty and transparency" },
		Dimension & { name: "Appropriate pace" },
	];
	summary: {
		free_text: string; // holistic reflection integrating key points
		bullet_points: string[]; // up to 3 succinct learning focuses
	};
}

export const AssessmentSchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		dimensions: {
			type: "array",
			minItems: 5,
			maxItems: 5,
			prefixItems: [
				// 1) Rapport
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							enum: ["Rapport, introduction, structure and flow"],
						},
						points: {
							type: "array",
							minItems: 0,
							maxItems: 3,
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									type: { type: "string", enum: ["strength", "improvement"] },
									text: { type: "string", pattern: '.*".+".*|.*“.+”.*' },
								},
								required: ["type", "text"],
							},
						},
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: ["name", "points", "insufficient_evidence", "red_flags"],
				},
				// 2) Empathy
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: {
							type: "string",
							enum: ["Empathy, listening and patient perspective"],
						},
						points: {
							type: "array",
							minItems: 0,
							maxItems: 3,
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									type: { type: "string", enum: ["strength", "improvement"] },
									text: { type: "string", pattern: '.*".+".*|.*“.+”.*' },
								},
								required: ["type", "text"],
							},
						},
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: ["name", "points", "insufficient_evidence", "red_flags"],
				},
				// 3) Medical explanation and plan
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: { type: "string", enum: ["Medical explanation and plan"] },
						points: {
							type: "array",
							minItems: 0,
							maxItems: 3,
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									type: { type: "string", enum: ["strength", "improvement"] },
									text: { type: "string", pattern: '.*".+".*|.*“.+”.*' },
								},
								required: ["type", "text"],
							},
						},
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: ["name", "points", "insufficient_evidence", "red_flags"],
				},
				// 4) Honesty and transparency
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: { type: "string", enum: ["Honesty and transparency"] },
						points: {
							type: "array",
							minItems: 0,
							maxItems: 3,
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									type: { type: "string", enum: ["strength", "improvement"] },
									text: { type: "string", pattern: '.*".+".*|.*“.+”.*' },
								},
								required: ["type", "text"],
							},
						},
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: ["name", "points", "insufficient_evidence", "red_flags"],
				},
				// 5) Appropriate pace
				{
					type: "object",
					additionalProperties: false,
					properties: {
						name: { type: "string", enum: ["Appropriate pace"] },
						points: {
							type: "array",
							minItems: 0,
							maxItems: 3,
							items: {
								type: "object",
								additionalProperties: false,
								properties: {
									type: { type: "string", enum: ["strength", "improvement"] },
									text: { type: "string", pattern: '.*".+".*|.*“.+”.*' },
								},
								required: ["type", "text"],
							},
						},
						insufficient_evidence: { type: "boolean" },
						red_flags: { type: "array", items: { type: "string" } },
					},
					required: ["name", "points", "insufficient_evidence", "red_flags"],
				},
			],
		},

		summary: {
			type: "object",
			additionalProperties: false,
			properties: {
				free_text: { type: "string" },
				bullet_points: {
					type: "array",
					minItems: 0,
					maxItems: 3,
					items: { type: "string" },
				},
			},
			required: ["free_text", "bullet_points"],
		},
	},
	required: ["dimensions", "summary"],
} as const;
