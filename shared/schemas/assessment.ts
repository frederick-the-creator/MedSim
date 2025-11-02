// Define Assessment Schema as both TypeScript type and JSON Schema

// Example object that matches Assessment Schema
// {
//   "dimensions": {
//     "rapport_introduction_structure_flow": {
//       "name": "Rapport, introduction, structure and flow",
//       "points": [
//         { "type": "strength", "text": "Clear structure and logical flow." },
//         { "type": "improvement", "text": "Could tighten the opening summary." }
//       ],
//       "insufficient_evidence": false,
//       "red_flags": []
//     },
//     "empathy_listening_patient_perspective": {....
//     }
//   },
//   "summary": {
//     "free_text": "Overall, this was a strong performance with clear communication and good empathy.",
//     "bullet_points": [
//       "Excellent rapport and flow",
//       "Good empathy and listening",
//       "Minor structural improvement suggested"
//     ]
//   }
// }

// --- Assessment Schema as TypeScript type

// 1) Literal names for the five fixed dimensions
export const dimensionKeys = [
	"rapport_introduction_structure_flow",
	"empathy_listening_patient_perspective",
	"medical_explanation_and_plan",
	"honesty_and_transparency",
	"appropriate_pace",
] as const;

export type DimensionKey = (typeof dimensionKeys)[number];

export const dimensionNames = [
	// By defining as array object we can use elsewhere to enforce order
	"Rapport, introduction, structure and flow",
	"Empathy, listening and patient perspective",
	"Medical explanation and plan",
	"Honesty and transparency",
	"Appropriate pace",
] as const;

type DimensionName = (typeof dimensionNames)[number];

// 2) Qualitative point — each either a strength or improvement, with inline quotes
type PointType = "strength" | "improvement";

interface Point {
	type: PointType;
	text: string; // should include direct quotes from the transcript
}

// 3) Single dimension (purely qualitative)
interface Dimension {
	name: DimensionName;
	points: Point[]; // 0–3 items, each is strength or improvement
	insufficient_evidence: boolean;
	red_flags: string[]; // e.g. unsafe advice, misinformation, etc.
}

// 4) Full assessment (no totals or scores)
// Assessment is an object with two properties: dimenions & summary
// -- dimensions
//	-- Has 5 properties, one for each of the dimensions  (named with underscore format)
//  -- Each property is of dimension type, with name fixed to one of the human readable names
//	 -- Dimension type primarily has a name and array of points

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

// --- Assessment Schema as JSON Schema

export const AssessmentSchema = {
	$id: "AssessmentSchema", // Gives the schema a unique name. Allows other JSON schema's to reference this one using $ref (e.g. { "$ref": "AssessmentSchema#/defs/Point" }). Even if schema is shared or serialised via API this reference is still valid
	type: "object", // Root ovalue must be JSON object
	additionalProperties: false, // No extra fields allowed beyond those explicitly defined
	$defs: {
		// Defines re-usable sub-schemas to be referenced elsewhere
		Point: {
			type: "object",
			additionalProperties: false,
			properties: {
				type: { type: "string", enum: ["strength", "improvement"] },
				text: { type: "string" }, // (avoid pattern; not reliably supported)
			},
			required: ["type", "text"], // Both type and text properties must be present
		},
		Dimension: {
			type: "object",
			additionalProperties: false,
			properties: {
				// keep name if you want it echoed back; otherwise drop it to simplify further
				name: { type: "string" },
				points: {
					// Array of objects
					type: "array",
					minItems: 0,
					maxItems: 3,
					items: { $ref: "#/$defs/Point" }, // points is an array of items where each item is a point object
				},
				insufficient_evidence: { type: "boolean" },
				red_flags: { type: "array", items: { type: "string" } },
			},
			required: ["name", "points", "insufficient_evidence", "red_flags"], // All properties are required
		},
	},
	properties: {
		// Defines the properties we expect from this schema
		// Only expecting two properties, dimensions & summary
		dimensions: {
			type: "object",
			additionalProperties: false,
			properties: {
				// Dimensions property expects 5 sub properties, one for each of the predetermined dimensions
				rapport_introduction_structure_flow: {
					allOf: [
						// Property must satisfy each of these schema constraints
						{ $ref: "#/$defs/Dimension" }, // Must be of the re-usable Dimension schema
						{
							properties: {
								name: { enum: ["Rapport, introduction, structure and flow"] }, // Reusable dimension schema must have name set to this value
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
