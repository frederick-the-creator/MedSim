<!-- 9d43d9a7-ecf4-40d0-b625-25a42968a04b 12785280-3c26-4045-a4bb-eeaa722bef8a -->
# Two-tier retries: upstream errors vs invalid JSON

### Where we’ll edit

```165:173:/Users/fredericklewis/Documents/alpha_projects/MedSim/server/features/assessment/services/assessment.ts
const response = await ai.models.generateContent({
  config: {
    systemInstruction,
    responseMimeType: "application/json",
    responseJsonSchema: schema,
  },
  contents,
  model,
});
```
```204:231:/Users/fredericklewis/Documents/alpha_projects/MedSim/server/features/assessment/services/assessment.ts
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  logger.info({ attempt }, "assessment_generation_attempt");
  const effectiveSystemInstruction = buildEffectiveSystemInstruction(
    baseSystemInstruction,
    attempt,
  );

  const { rawText, parsed } = await requestAssessmentJson(
    ai,
    contents,
    effectiveSystemInstruction,
    "gemini-2.5-pro",
    schema,
  );

  const validated = validateAssessment(parsed);
  if (validated) return validated;

  if (attempt < maxAttempts) {
    await new Promise((r) =>
      setTimeout(r, initialDelayMs + attempt * delayIncrementMs),
    );
  }
}

throw new Error("Model returned invalid assessment JSON after retries");
```

### Plan

- Add upstream-only retry inside `requestAssessmentJson`:
  - Create `isTransientGeminiError(err: ApiError)` that checks ONLY `err.status`.
    - Retry when `status === 429` or `500 <= status <= 599` (includes 503 UNAVAILABLE).
  - Wrap `ai.models.generateContent(...)` in a small loop with its own config (`maxAttempts`, `baseMs`, `jitterMs`, optional `maxDelayMs`). On retryable status and attempts remaining, sleep and retry; otherwise rethrow.
- Keep `generateAssessmentWithRetries` dedicated to schema/validation retries only (unchanged).
- No extra logging in services; middleware handles error logs. Route context already set.

### Helper (typed, status-only)

```ts
import type { ApiError } from "@google/genai";

function isTransientGeminiError(err: ApiError): boolean {
  const s = err.status;
  return s === 429 || (s >= 500 && s <= 599);
}
```

### Inner upstream retry (uses status-only helper)

```ts
async function generateContentWithTransientRetries(
  ai: GenAIClient,
  args: any,
  cfg: { maxAttempts: number; baseMs: number; maxDelayMs?: number; jitterMs?: number } = {
    maxAttempts: 3,
    baseMs: 400,
    maxDelayMs: 2000,
    jitterMs: 120,
  },
) {
  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(args);
    } catch (e) {
      const err = e as ApiError; // SDK error type
      if (attempt >= cfg.maxAttempts || !isTransientGeminiError(err)) throw err;
      const exp = Math.min(cfg.baseMs * 2 ** (attempt - 1), cfg.maxDelayMs ?? Infinity);
      const jitter = Math.floor(Math.random() * (cfg.jitterMs ?? 0));
      await new Promise((r) => setTimeout(r, exp + jitter));
    }
  }
}
```

### Use inner retry inside `requestAssessmentJson`

```ts
const response = await generateContentWithTransientRetries(ai, {
  config: { systemInstruction, responseMimeType: "application/json", responseJsonSchema: schema },
  contents,
  model,
});
```

### Todos

- add-transient-check: Add typed `isTransientGeminiError(ApiError)` in `services/assessment.ts` (status-only).
- wrap-gemini-call: Add `generateContentWithTransientRetries` and use it in `requestAssessmentJson`.
- leave-validation-retry: Keep `generateAssessmentWithRetries` for schema validation retries only.