import { MedicalCase } from "@shared/schemas/case";
import type { Assessment } from "@shared/schemas/assessment";

type AssessmentResult = {
	assessment: Assessment | null;
	transcript: string | null;
};

export async function fetchAssessment(
	conversationId: string,
	medicalCase: MedicalCase,
): Promise<AssessmentResult> {
	const resp = await fetch("/api/assessment", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ conversationId, medicalCase }),
	});
	if (!resp.ok) {
		const errJson = await resp.json().catch(() => ({}) as any);
		const message =
			(errJson && (errJson.message as string)) || `Server error ${resp.status}`;
		throw new Error(message);
	}
	const json = await resp.json();
	return {
		assessment: json.assessment ?? null,
		transcript: json.transcript ?? null,
	};
}
