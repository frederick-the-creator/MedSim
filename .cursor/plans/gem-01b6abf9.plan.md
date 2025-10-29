<!-- 01b6abf9-856a-4d5f-b42d-41f75e104856 9c51443a-f0b8-431b-8f4e-5161c799c339 -->
# Refactor assessWithGemini: Extract Retry and Validation

## Goal

Separate retry/backoff and validation/normalization from `assessWithGemini`, similar to `pollTranscriptWithBackoff` and `getElevenTranscriptOnce`, while preserving the external function signature and behavior.

## Files Touched

- `server/features/assessment/services/assessment.ts`

## Key Changes

1. Add small helpers in the same file:

   - `buildEffectiveSystemInstruction(base: string, attempt: number): string`
   - `requestAssessmentJson(ai: GoogleGenAI, contents: { text: string }[], systemInstruction: string, model: string): Promise<{ rawText: string; parsed: unknown }>`
   - `validateAndNormalizeAssessment(candidate: unknown): Assessment | null`
   - `generateAssessmentWithRetries(params): Promise<Assessment>`

2. Refactor `assessWithGemini` to:

   - Instantiate the client and prepare `contents`
   - Delegate to `generateAssessmentWithRetries(...)`

## Helper Signatures (concise)

```ts
function buildEffectiveSystemInstruction(base: string, attempt: number): string;

async function requestAssessmentJson(
  ai: InstanceType<typeof GoogleGenAI>,
  contents: { text: string }[],
  systemInstruction: string,
  model: string,
): Promise<{ rawText: string; parsed: unknown }>;

function validateAndNormalizeAssessment(candidate: unknown): Assessment | null;

interface GeminiRetryConfig {
  maxAttempts: number;          // default 3
  initialDelayMs: number;       // default 300
  delayIncrementMs: number;     // default 200
}

async function generateAssessmentWithRetries(
  ai: InstanceType<typeof GoogleGenAI>,
  contents: { text: string }[],
  baseSystemInstruction: string,
  schema: unknown,               // AssessmentSchema
  model: string,                 // "gemini-2.5-pro"
  cfg?: Partial<GeminiRetryConfig>,
): Promise<Assessment>;
```

## Behavior Details

- `buildEffectiveSystemInstruction` appends the existing validation reminder for attempts > 1.
- `requestAssessmentJson` performs a single model call and returns both `rawText` and safely `parsed` JSON (empty object on parse failure), similar to `getElevenTranscriptOnce` doing one probe.
- `validateAndNormalizeAssessment` wraps `normalizeAssessment` + `isAssessment` and returns `Assessment | null`.
- `generateAssessmentWithRetries` loops up to `maxAttempts`, calling `requestAssessmentJson`, validating via `validateAndNormalizeAssessment`, logging a short preview on failure, and sleeping `initialDelayMs + (attempt * delayIncrementMs)` between attempts, then throws on exhaustion.

## assessWithGemini Rewire (essential snippet)

```ts
export async function assessWithGemini({ systemInstruction, medicalCase, transcript }: {
  systemInstruction: string; medicalCase: string; transcript: string;
}): Promise<Assessment> {
  const apiKey = process.env.GEMINI_API_KEY;
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const contents = [{ text: medicalCase }, { text: transcript }];

  return generateAssessmentWithRetries(
    ai,
    contents,
    systemInstruction,
    AssessmentSchema,
    "gemini-2.5-pro",
    { maxAttempts: 3, initialDelayMs: 300, delayIncrementMs: 200 },
  );
}
```

## Notes

- No API changes for callers.
- Logging behavior retained (key preview, failure preview up to 500 chars).
- Keeps JSON Schema usage via `AssessmentSchema` exactly as before.

### To-dos

- [ ] Add helper functions for system instruction, request, validation, retries
- [ ] Refactor assessWithGemini to use generateAssessmentWithRetries
- [ ] Retain key preview and failure preview logs with limits
- [ ] Ensure types for helpers and defaults match current behavior