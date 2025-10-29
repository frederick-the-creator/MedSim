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
	dimensions: {
		rapport_introduction_structure_flow: Dimension & {
			name: "Rapport, introduction, structure and flow";
		};
		empathy_listening_patient_perspective: Dimension & {
			name: "Empathy, listening and patient perspective";
		};
		medical_explanation_and_plan: Dimension & {
			name: "Medical explanation and plan";
		};
		honesty_and_transparency: Dimension & {
			name: "Honesty and transparency";
		};
		appropriate_pace: Dimension & { name: "Appropriate pace" };
	};
	summary: {
		free_text: string; // holistic reflection integrating key points
		bullet_points: string[]; // up to 3 succinct learning focuses
	};
}

export const DIMENSION_KEYS = [
	"rapport_introduction_structure_flow",
	"empathy_listening_patient_perspective",
	"medical_explanation_and_plan",
	"honesty_and_transparency",
	"appropriate_pace",
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export const AssessmentSchema = {
	$id: "AssessmentSchema",
	type: "object",
	additionalProperties: false,
	$defs: {
		Point: {
			type: "object",
			additionalProperties: false,
			properties: {
				type: { type: "string", enum: ["strength", "improvement"] },
				text: { type: "string" }, // (avoid pattern; not reliably supported)
			},
			required: ["type", "text"],
		},
		Dimension: {
			type: "object",
			additionalProperties: false,
			properties: {
				// keep name if you want it echoed back; otherwise drop it to simplify further
				name: { type: "string" },
				points: {
					type: "array",
					minItems: 0,
					maxItems: 3,
					items: { $ref: "#/$defs/Point" },
				},
				insufficient_evidence: { type: "boolean" },
				red_flags: { type: "array", items: { type: "string" } },
			},
			required: ["name", "points", "insufficient_evidence", "red_flags"],
		},
	},
	properties: {
		dimensions: {
			type: "object",
			additionalProperties: false,
			properties: {
				rapport_introduction_structure_flow: {
					allOf: [
						{ $ref: "#/$defs/Dimension" },
						{
							properties: {
								name: { enum: ["Rapport, introduction, structure and flow"] },
							},
						},
					],
				},
				empathy_listening_patient_perspective: {
					allOf: [
						{ $ref: "#/$defs/Dimension" },
						{
							properties: {
								name: { enum: ["Empathy, listening and patient perspective"] },
							},
						},
					],
				},
				medical_explanation_and_plan: {
					allOf: [
						{ $ref: "#/$defs/Dimension" },
						{
							properties: { name: { enum: ["Medical explanation and plan"] } },
						},
					],
				},
				honesty_and_transparency: {
					allOf: [
						{ $ref: "#/$defs/Dimension" },
						{ properties: { name: { enum: ["Honesty and transparency"] } } },
					],
				},
				appropriate_pace: {
					allOf: [
						{ $ref: "#/$defs/Dimension" },
						{ properties: { name: { enum: ["Appropriate pace"] } } },
					],
				},
			},
			required: [
				"rapport_introduction_structure_flow",
				"empathy_listening_patient_perspective",
				"medical_explanation_and_plan",
				"honesty_and_transparency",
				"appropriate_pace",
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
