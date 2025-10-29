import { z } from "zod";

// Zod schemas to unify runtime validation and static typing
export const vignetteSchema = z.object({
	background: z.object({
		patientName: z.string(),
		age: z.number(),
		gender: z.string(),
		clinicType: z.string(),
		referralSource: z.string(),
		scenario: z.string(),
	}),
	task: z.string(),
	triageNote: z.string(),
	keyFindings: z.record(z.union([z.string(), z.array(z.string())])),
});

export const historySchema = z.object({
	PC: z.string(),
	HPC: z.object({
		summary: z.string(),
		onset_course: z.string(),
		duration: z.string(),
		laterality: z.string(),
		quality_modifiers: z.string(),
		associated_symptoms: z.string(),
		negatives: z.string(),
		triggers_exposures: z.string(),
		visual_function: z.string(),
		timeline: z.string(),
	}),
	PMH: z.object({ conditions: z.array(z.string()) }),
	DHX: z.object({ medications: z.string(), allergies: z.string() }),
	SHX: z.object({
		living_situation: z.string(),
		occupation: z.string(),
		smoking_alcohol: z.string(),
		driving_status: z.string(),
		support: z.string(),
	}),
	FHX: z.object({ details: z.string() }),
	ICE: z.object({
		ideas: z.string(),
		concerns: z.string(),
		expectations: z.string(),
	}),
	reaction: z.object({
		trigger: z.string(),
		reaction_to_probe: z.string(),
		if_denied_surgery: z.string(),
	}),
});

export const modelAnswerSchema = z.object({
	diagnosis: z.object({
		likelyDiagnosis: z.string(),
		rationale: z.string(),
		differentials: z.array(
			z.object({
				condition: z.string(),
				reasoning: z.string(),
			}),
		),
	}),
	focusedAssessment: z.object({
		historyQuestions: z.array(z.string()),
		examinationInterpretation: z.object({
			vaRight: z.string(),
			vaLeft: z.string(),
			fundusRight: z.string(),
			fundusLeft: z.string(),
		}),
	}),
	immediateManagement: z.object({
		explainDiagnosis: z.string(),
		urgentEscalation: z.array(z.string()),
		initiateTreatmentPathway: z.object({
			summary: z.string(),
			mechanismExplanation: z.string(),
			procedureExplanation: z.string(),
			needlePhobiaReassurance: z.string().optional(),
		}),
		consent: z.object({
			approach: z.string(),
			commonRisks: z.array(z.string()),
		}),
		timing: z.string(),
		safetyNet: z.array(z.string()),
		patientLeaflet: z.string().optional(),
	}),
	auxiliarySupport: z.object({
		dvlaAdvice: z.string(),
		supportActions: z.array(z.string()),
	}),
});

export const medicalCaseSchema = z.object({
	id: z.number(),
	agentId: z.string(),
	vignette: vignetteSchema,
	history: historySchema,
	modelAnswer: modelAnswerSchema,
});

// Medical case types (inferred from Zod schema)
export type MedicalCase = z.infer<typeof medicalCaseSchema>;
