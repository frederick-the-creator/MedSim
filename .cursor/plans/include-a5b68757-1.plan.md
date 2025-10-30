<!-- a5b68757-5f36-48b8-8354-fce0b99d9261 c97a474b-b28a-4768-9df8-6d268c201b85 -->
# Coach payload integration and assessment hardening (retrospective)

## Overview

Send the active medical case to the coach API, require transcript/assessment/medicalCase end-to-end, remove fallbacks, and harden the assessment route so it never returns success with empty/null outputs. Gate UI rendering on validated data.

## Changes

### 1) Shared schema

- File: `shared/schemas/coach.ts`
- Extended `coachRequestSchema` to include `medicalCase` and made `transcript`, `assessment`, and `medicalCase` required (no defaults).

### 2) Client payload and UI guards

- File: `client/src/pages/casePractice.tsx`
- In `handleSendMessage`:
- Require `transcript` and `assessment` before sending; throw if missing.
- Send `{ transcript, assessment: JSON.stringify(assessment), medicalCase }` without fallbacks.
- Rendering guard: only render the second row when `assessment && transcript`.

### 3) Coach system instruction

- File: `server/features/coach/services/coach.ts`
- `buildCoachSystemInstruction(assessment: string, transcript: string, medicalCase: MedicalCase)` now requires `medicalCase` and removes string fallbacks.
- Added a dedicated `=== CASE CONTEXT ===` section (pretty-printed JSON) ahead of assessment and transcript.

### 4) Coach route wiring

- File: `server/features/coach/routes/coach.ts`
- Call `buildCoachSystemInstruction(body.assessment, body.transcript, body.medicalCase)`; removed `??` fallbacks.

### 5) Assessment route hardening

- File: `server/features/assessment/routes/assessment.ts`
- If `transcript` is empty, return `409` with `Retry-After` header (transcript not ready) — no success with empty transcript.
- After generating assessment, verify with `isAssessment`; if invalid/missing, return `502` (generation failed).
- Success response includes non-empty `transcript` and validated `assessment` only.

## Rationale

- Prevents downstream null/empty states, ensuring the coach always receives complete context.
- UI only renders `AssessmentCard`/`CoachInterface` when the data is valid, removing the need for non-null assertions.

## Impact

- Safer server semantics: clients can rely on failure when data is not ready/invalid.
- More grounded coaching responses via explicit case context.
- Clearer client control flow and rendering guarantees.

## Potential follow-ups

- Trim `CASE CONTEXT` to the most relevant fields if token limits become a concern.
- Add telemetry for 409/502 counts to monitor readiness and generation quality.
- Add e2e tests covering transcript-not-ready and invalid-assessment paths.

### To-dos

- [ ] Extend coachRequestSchema to accept optional medicalCase
- [ ] Send medicalCase in CasePractice handleSendMessage body
- [ ] Include medicalCase in buildCoachSystemInstruction CASE section
- [ ] Pass body.medicalCase to buildCoachSystemInstruction in coach route