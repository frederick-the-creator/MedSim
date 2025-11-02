<!-- 3c8ed6c0-738e-4e66-9e48-66fa5f0c9a46 a9c49f4e-43a3-4858-ae94-2ae8675e19b8 -->
# Improve assessment 409 path logging and align with error-handling rules

```16:27:/Users/fredericklewis/Documents/alpha_projects/MedSim/server/features/assessment/routes/assessment.ts
res.locals.context = { op: "assessment.generate" };
const { conversationId, medicalCase } = parseAssessmentRequestBody(req.body);

const transcript = await fetchTranscriptFromElevenLabs(conversationId);

if (!transcript || transcript.length === 0) {
  const maxDelayMs = Number(process.env.ASSESSMENT_POLL_MAX_DELAY_MS ?? 3000);
  const retryAfterSecs = Math.ceil(Math.min(maxDelayMs, 3000) / 1000);
  res.setHeader("Retry-After", String(retryAfterSecs));
  res.status(409).json({ message: "Transcript not ready" });
  return;
}
```

### What will change

- Set richer context early in the route: include `conversationId` and the upstream `provider`.
- Emit a domain event log for the 409 path using `req.log` (not the global logger) with small metadata (`retryAfterSecs`, `conversationId`).
- Replace `logger.info` calls with `req.log.info` to follow the standard and keep logs correlated to the request id.
- Keep response semantics the same (409 + `Retry-After`). Do not throw; this is flow control, not an error. The WARN summary you see is from the HTTP logger; we’ll add an explicit info-level event with domain context.

### Concise edits

- In `server/features/assessment/routes/assessment.ts`:
  - Expand context:
    - From: `res.locals.context = { op: "assessment.generate" }`
    - To: `res.locals.context = { op: "assessment.generate", conversationId, provider: "elevenlabs" }`
  - Before returning 409, add:
    ```ts
    req.log.info(
      { reason: "transcript_not_ready", retryAfterSecs, conversationId },
      "assessment_transcript_not_ready"
    );
    ```

  - Replace global `logger.info(...)` usages with `req.log.info(...)` and remove the unused `logger` import.

### Rationale

- Matches the standard: routes use `req.log`, set `res.locals.context`, avoid try/catch for control flow, and produce small, structured event logs. Throwing here would inappropriately route to 500 or force custom 409 error plumbing.

### To-dos

- [ ] Add conversationId and provider to res.locals.context in assessment route
- [ ] Log info event for transcript-not-ready with retryAfterSecs via req.log
- [ ] Replace global logger.info with req.log.info and remove import