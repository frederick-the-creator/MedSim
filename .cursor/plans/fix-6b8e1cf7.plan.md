<!-- 6b8e1cf7-18d3-40a4-8870-201e7a063890 9f26a48f-314f-46e7-bf20-8d9f485bb41f -->
# Fix rendering race after assessment fetch

- **Goal**: Ensure the second row (Assessment + Coach chat) renders immediately after ending the conversation the first time.
- **Root cause**: `casePractice.tsx` reads `assessmentHook.assessment` and `assessmentHook.transcript` right after `await run(...)`. The hook sets state asynchronously, so values are stale on the first attempt and only available on the next run.

### Changes

1. Update `client/src/hooks/useAssessment.ts`

- Change `UseAssessmentResult.run` to return `{ assessment, transcript }`.
- On success: set internal state and return those values.
- On failure: set error and rethrow so callers can catch.

2. Update `useAssessmentMock` accordingly (same return + throw behavior).
3. Update `useAssessmentAuto` type passthrough (no behavioral change, just types).
4. Update `client/src/pages/casePractice.tsx`

- In `handleEndConversation`, use the returned `{ assessment, transcript }` from `run` to set local state.
- Remove the immediate `assessmentHook.error` check and rely on try/catch.

### Snippets (essential deltas)

- `useAssessment.ts` (types):
- Before: `run: (conversationId: string, medicalCase: MedicalCase) => Promise<void>`
- After: `run: (conversationId: string, medicalCase: MedicalCase) => Promise<{ assessment: Assessment | null; transcript: string | null; }>`
- `casePractice.tsx` (handler):
- Before: `await assessmentHook.run(...); setAssessment(assessmentHook.assessment); setTranscript(assessmentHook.transcript);`
- After: `const { assessment, transcript } = await assessmentHook.run(...); setAssessment(assessment); setTranscript(transcript);`

### Notes

- This is backward-compatible within this app since `run` is only used here.
- Keeps the loading dialog logic unchanged.

### To-dos

- [ ] Change run() to return assessment+transcript and throw on error
- [ ] Change mock run() to return assessment+transcript and throw on error
- [ ] Adjust useAssessmentAuto types to match new run signature
- [ ] Use returned values from run() in handleEndConversation; remove error flag check