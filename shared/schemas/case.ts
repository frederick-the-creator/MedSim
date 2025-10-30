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
		onset_course: z.string().optional(),
		duration: z.string().optional(),
		laterality: z.string().optional(),
		quality_modifiers: z.string().optional(),
		associated_symptoms: z.string().optional(),
		negatives: z.string().optional(),
		triggers_exposures: z.string().optional(),
		visual_function: z.string().optional(),
		timeline: z.string().optional(),
	}),
	PMH: z.object({
		conditions: z.array(z.string()).optional(), // allow empty PMH
	}),
	DHX: z.object({
		medications: z.union([z.string(), z.array(z.string())]).optional(),
		allergies: z.string().optional(),
		steroid_history: z.string().optional(),
	}),
	SHX: z.object({
		living_situation: z.string().optional(),
		occupation: z.string().optional(),
		smoking_alcohol: z.string().optional(),
		driving_status: z.string().optional(),
		support: z.string().optional(),
		hobbies: z.string().optional(),
	}),
	FHX: z.object({
		details: z.array(z.string()).optional(),
	}),
	ICE: z.object({
		ideas: z.string().optional(),
		concerns: z.string().optional(),
		expectations: z.string().optional(),
	}),
	// Support either a single narrative string or a structured block
	reaction: z
		.union([
			z.string(),
			z.object({
				trigger: z.string().optional(),
				reaction_to_probe: z.string().optional(),
				if_denied_surgery: z.string().optional(),
			}),
		])
		.optional(),
});

export const modelAnswerSchema = z.object({
	diagnosis: z.object({
		likelyDiagnosis: z.string(),
		rationale: z.string().optional(),
		differentials: z
			.array(
				z.object({
					condition: z.string(),
					reasoning: z.string().optional(),
				}),
			)
			.optional(),
	}),
	focusedAssessment: z.object({
		historyQuestions: z.array(z.string()).optional(),
		// Make exam interpretation free-form; not all cases have VA/fundus
		examinationInterpretation: z.record(z.string()).optional(),
	}),
	immediateManagement: z.object({
		explainDiagnosis: z.string().optional(),
		urgentEscalation: z.array(z.string()).optional(),
		// Generic plan elements so AACG, eyelid lesions, uveitis, etc. all fit
		medications: z
			.array(
				z.object({
					route: z.string().optional(), // e.g., "PO", "IV", "Topical"
					name: z.string(),
					dose: z.string().optional(),
					frequency: z.string().optional(),
					notes: z.string().optional(),
				}),
			)
			.optional(),
		procedures: z
			.array(
				z.object({
					name: z.string(),
					side: z.string().optional(), // e.g., "Left", "Right", "Both"
					timing: z.string().optional(),
					notes: z.string().optional(),
				}),
			)
			.optional(),
		admissionRequired: z.boolean().optional(),
		consent: z
			.object({
				approach: z.string().optional(),
				commonRisks: z.array(z.string()).optional(),
			})
			.optional(),
		timing: z.string().optional(),
		safetyNet: z.array(z.string()).optional(),
		patientLeaflet: z.string().optional(),
		referrals: z.array(z.string()).optional(), // e.g., ECLO, GP, DVLA notify
	}),
	auxiliarySupport: z
		.object({
			dvlaAdvice: z.string().optional(),
			supportActions: z.array(z.string()).optional(),
		})
		.optional(),
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
