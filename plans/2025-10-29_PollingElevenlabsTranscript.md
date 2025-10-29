<!-- 75bf7c71-53ce-43c3-aee7-4f5525a90585 78cc35ce-186c-48fe-a8b5-d00d572c472d -->
# Server-side polling in services for ElevenLabs transcript readiness

### Summary

Move the polling logic into the services layer so the route remains simple. Implement a polling wrapper with exponential backoff and jitter in `server/features/assessment/services/assessment.ts`. Update `fetchTranscriptFromElevenLabs` to use the wrapper. If the polling budget is exhausted, it returns an empty string; the route continues to return 409 as it does today (optionally adding `Retry-After`). No client changes.

### Files to update (absolute paths)

- `/Users/fredericklewis/Documents/alpha_projects/MedSim/server/features/assessment/services/assessment.ts`

### Implementation details

- Introduce polling config with sane defaults, overridable via envs (read inside services):
  - `ASSESSMENT_POLL_MAX_MS` (default 10000)
  - `ASSESSMENT_POLL_BASE_MS` (default 300)
  - `ASSESSMENT_POLL_MAX_DELAY_MS` (default 3000)
- Extract the single-shot ElevenLabs call into a private helper `getElevenTranscriptOnce(conversationId): Promise<string>` that returns "" if not done yet and throws on HTTP errors.
- Add `pollTranscriptWithBackoff(conversationId, cfg): Promise<string>` that:
  - Loops until a deadline (`Date.now() + maxMs`).
  - Calls `getElevenTranscriptOnce` each iteration.
  - If a non-empty transcript is returned, resolves immediately.
  - Otherwise sleeps using backoff-with-jitter: `delay = Math.floor(Math.random() * Math.min(maxDelay, base * 2 ** attempt))`, then retries.
  - On deadline, returns "" (do not throw) so the route can decide 409.
- Update `fetchTranscriptFromElevenLabs(conversationId)` to call `pollTranscriptWithBackoff` with env-based defaults and return its result.
- Keep `assessWithGemini` unchanged. Keep `assessmentRoute` unchanged; optionally set `Retry-After` on 409.

### Minimal code sketch (for clarity)

```ts
// server/features/assessment/services/assessment.ts
async function getElevenTranscriptOnce(id: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY; if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing");
  const url = `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(id)}`;
  const resp = await fetch(url, { headers: { "xi-api-key": apiKey, "Content-Type": "application/json" } });
  if (!resp.ok) throw new Error(`ElevenLabs error ${resp.status}: ${resp.statusText}`);
  const json = (await resp.json()) as ElevenConversationResponse;
  if (json.status && json.status !== "done") return "";
  if (Array.isArray(json.transcript)) { /* map to lines */ }
  if (typeof json.transcript === "string") return json.transcript;
  return "";
}

async function pollTranscriptWithBackoff(id: string, { maxMs, baseMs, maxDelayMs }: { maxMs: number; baseMs: number; maxDelayMs: number; }): Promise<string> {
  const deadline = Date.now() + maxMs; let attempt = 0; let transcript = "";
  while (Date.now() < deadline) {
    transcript = await getElevenTranscriptOnce(id);
    if (transcript) break;
    const delay = Math.floor(Math.random() * Math.min(maxDelayMs, baseMs * 2 ** attempt));
    await new Promise(r => setTimeout(r, delay));
    attempt++;
  }
  return transcript; // "" if not ready
}

export async function fetchTranscriptFromElevenLabs(conversationId: string): Promise<string> {
  const maxMs = Number(process.env.ASSESSMENT_POLL_MAX_MS ?? 10000);
  const baseMs = Number(process.env.ASSESSMENT_POLL_BASE_MS ?? 300);
  const maxDelayMs = Number(process.env.ASSESSMENT_POLL_MAX_DELAY_MS ?? 3000);
  return pollTranscriptWithBackoff(conversationId, { maxMs, baseMs, maxDelayMs });
}
```

### Notes

- Exceptions from HTTP/network still bubble to `errorMiddleware`.
- No API shape changes; route behavior stays consistent.
- Uses absolute paths per your preference.

### To-dos

- [ ] Add polling config constants and env reads in services file
- [ ] Implement `pollTranscriptWithBackoff` wrapper in services
- [ ] Update `fetchTranscriptFromElevenLabs` to use the wrapper
- [ ] Add polling config constants and env reads in assessment route
- [ ] Implement exponential backoff + jitter loop in assessmentRoute
- [ ] Set Retry-After header on 409 response