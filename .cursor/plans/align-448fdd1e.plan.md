<!-- 448fdd1e-e8ca-483b-aef5-1b017a2ff8ec b3c66d79-d053-4542-817e-b86182e881a3 -->
# Tighten Prompt, Normalize Response, Validate + Retry

### Goal

Ensure Gemini returns JSON that conforms to `AssessmentSchema`. Strengthen the system prompt, add a server-side normalizer that coerces model output to the schema, validate, and retry generation if validation fails.

### Files to Update / Add

- `/Users/fredericklewis/Documents/alpha_projects/MedSim/shared/prompts/assessment_system.ts`
- `/Users/fredericklewis/Documents/alpha_projects/MedSim/server/features/assessment/services/assessment.ts`
- `/Users/fredericklewis/Documents/alpha_projects/MedSim/server/shared/utils/assessmentNormalize.ts` (new)
- `/Users/fredericklewis/Documents/alpha_projects/MedSim/tests/assessment-normalize.test.ts` (new)

### Prompt Updates (essential)

Add a “Strict JSON Output Rules” block to the end of the prompt:

- Output MUST match the provided JSON Schema exactly (no additional properties).
- Dimensions MUST be an object with the following keys (exact):
- `rapport_introduction_structure_flow`
- `empathy_listening_patient_perspective`
- `medical_explanation_and_plan`
- `honesty_and_transparency`
- `appropriate_pace`
- For each dimension, include these fields:
- `name`: the exact canonical string provided for that dimension.
- `points`: array of 0–3 items; each item has `type` (`"strength"|"improvement"`) and `text` (string with direct quote evidence).
- `insufficient_evidence`: boolean (include even if false).
- `red_flags`: string[] (include even if empty).
- Summary must include `free_text` (string) and `bullet_points` (≤3 strings).
- Do NOT include any extra fields (for example, `score` is not allowed).
- If evidence is insufficient, set `insufficient_evidence` true and still produce an empty `points` array and empty `red_flags`.

### Normalizer (server)

Create `normalizeAssessment(raw: unknown): Assessment | null` that:

- Converts dimensions to the object-key form if an array is returned (map by `name` to slug keys).
- For each dimension key, ensure only allowed fields remain; drop extras (e.g., `score`).
- Coerce/guard:
- `points`: array; keep only valid items; clamp to ≤3; coerce `type` to allowed values; ensure `text` is string.
- `insufficient_evidence`: boolean default false.
- `red_flags`: string[] default [].
- `name`: overwrite to the canonical name for that slug key.
- Summary: ensure `free_text` string default `""`; `bullet_points` string[] length ≤3.
- Return `null` if the result still fails `isAssessment`.

### Integrate Validation + Retry

In `assessWithGemini`:
1) Generate once.
2) Parse JSON text safely.
3) Normalize → validate (`isAssessment`). If valid, return.
4) If invalid, retry generation up to 2 additional times (total 3 attempts) with short backoff. Optionally, augment the second/third attempts with a brief reminder appended to the system instruction: “Your previous output failed schema validation. Follow the schema exactly; do not add extra fields.”
5) If still invalid, throw a 502/500 with a clear message.

### Observability

- Log validation failures with a short reason and a truncated preview (e.g., first 500 chars). Avoid logging full transcripts when not needed.

### Tests

- Unit tests for the normalizer with inputs that:
- Include extra fields (e.g., `score`).
- Omit `insufficient_evidence`/`red_flags`.
- Provide array-form dimensions.
- Over-long `points` arrays or bad `type` values.
- Assert normalized output passes `isAssessment`.

### To-dos

- [ ] Add strict JSON schema rules to assessment_system prompt
- [ ] Create normalizeAssessment to coerce raw model JSON to schema
- [ ] Use normalizer + isAssessment; retry Gemini up to 3 total attempts
- [ ] Unit test normalizer for extras, missing fields, array dims, coercions
- [ ] Add concise validation failure logs with truncated payload