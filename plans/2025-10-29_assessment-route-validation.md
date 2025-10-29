<!-- ebd279df-cad7-40f3-9021-6a84000fd3cf af600cc8-25a9-4dec-a557-80b86eb8c41c -->
# Add Zod validation to assessment route using shared schemas

### What we'll do

- Define Zod schemas in `shared/schema.ts` for `Vignette`, `History`, `ModelAnswer`, and `MedicalCase`; export `MedicalCase` type via `z.infer` from the new schema to keep a single source of truth across server and client.
- Create `assessmentRequestSchema` and a helper `parseAssessmentRequestBody` in `server/shared/utils/validation.ts` that validates `{ conversationId, medicalCase }` and throws `ZodError` on failure (handled by `server/middleware/errorMiddleware.ts`).
- Update `server/features/assessment/routes/assessment.ts` to use the parser and remove the manual `conversationId` check; keep the `409` when transcript isn’t ready.

### Key edits

- `shared/schema.ts` add Zod schemas and infer types:
```ts
// Add near existing interfaces
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
    differentials: z.array(z.object({
      condition: z.string(),
      reasoning: z.string(),
    })),
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

// Replace interface-based MedicalCase export with Zod-inferred type
export type MedicalCase = z.infer<typeof medicalCaseSchema>;
```

- `server/shared/utils/validation.ts` add request schema and helper:
```ts
import { z } from "zod";
import { medicalCaseSchema } from "@shared/schema";

export const assessmentRequestSchema = z.object({
  conversationId: z.string().min(1),
  medicalCase: medicalCaseSchema,
});

export type AssessmentRequestBody = z.infer<typeof assessmentRequestSchema>;

export function parseAssessmentRequestBody(body: unknown): AssessmentRequestBody {
  return assessmentRequestSchema.parse(body);
}
```

- `server/features/assessment/routes/assessment.ts` wire validation:
```ts
import { parseAssessmentRequestBody } from "@server/shared/utils/validation";

export async function assessmentRoute(req, res, next) {
  try {
    const { conversationId, medicalCase } = parseAssessmentRequestBody(req.body);
    const transcript = await fetchTranscriptFromElevenLabs(conversationId);
    if (!transcript || transcript.length === 0) {
      res.status(409).json({ message: "Transcript not ready" });
      return;
    }
    // ... proceed unchanged
  } catch (err) {
    next(err);
  }
}
```

### To-dos

- [ ] Add Zod schemas in shared/schema.ts and export inferred MedicalCase type
- [ ] Create assessmentRequestSchema and parser in server/shared/utils/validation.ts
- [ ] Use parseAssessmentRequestBody in assessmentRoute; remove manual checks