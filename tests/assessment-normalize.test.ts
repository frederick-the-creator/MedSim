import { describe, it, expect } from "vitest";
import { normalizeAssessment } from "@server/shared/utils/assessmentNormalize";
import { isAssessment } from "@server/shared/utils/validation";

describe("normalizeAssessment", () => {
	it("drops extra fields and fills required booleans/arrays", () => {
		const raw = {
			dimensions: {
				rapport_introduction_structure_flow: {
					name: "Rapport, introduction, structure and flow",
					points: [
						{ type: "strength", text: 'Good intro: "Hello, I\'m..."' },
						{ type: "improvement", text: "Add closing summary" },
					],
					score: 3,
				},
				empathy_listening_patient_perspective: {
					name: "Empathy, listening and patient perspective",
					points: [],
					score: null,
				},
				medical_explanation_and_plan: {
					name: "Medical explanation and plan",
					points: [],
				},
				honesty_and_transparency: {
					name: "Honesty and transparency",
					points: [],
				},
				appropriate_pace: {
					name: "Appropriate pace",
					points: [],
				},
			},
			summary: { free_text: "", bullet_points: [] },
		};
		const normalized = normalizeAssessment(raw);
		expect(normalized).not.toBeNull();
		expect(isAssessment(normalized!)).toBe(true);
	});

	it("converts array-shaped dimensions into object-shaped", () => {
		const raw = {
			dimensions: [
				{
					name: "Rapport, introduction, structure and flow",
					points: [{ type: "strength", text: "Clear intro" }],
				},
				{
					name: "Empathy, listening and patient perspective",
					points: [],
				},
			],
			summary: { free_text: "ok", bullet_points: ["a", "b"] },
		};
		const normalized = normalizeAssessment(raw);
		expect(normalized).not.toBeNull();
		expect(isAssessment(normalized!)).toBe(true);
	});
});
