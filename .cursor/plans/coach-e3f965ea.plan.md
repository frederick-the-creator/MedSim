<!-- e3f965ea-bb1e-4764-bc88-c36d233cb320 f8cf64e4-e395-4c57-b885-8ef69c1351c7 -->
# Route streams; service persists final text (thin route, zero latency)

- Goal: Route streams Gemini chunks immediately, accumulates `finalText`, then calls a service to append the assistant message and upsert to `public.coach`. Upsert is fire-and-forget to avoid latency.

### Files to change

- `server/features/coach/routes/coach.ts`
- `server/features/coach/services/coach.ts`
- `server/features/coach/repos/coach.ts`

### Key changes

- Route (`coachRoute`):
  - Use existing `generateContentStream(reqBody)` which yields `GenerateContentResponse`.
  - Accumulate while streaming without delaying writes.
  - After `res.end()`, call `saveCoachConversation` with `{ conversationId: "TEST-COACH", priorMessages: reqBody.messages, assistantText: acc.trim() }` and a child logger; do not await.

Minimal route loop and call:

```ts
let acc = "";
for await (const chunk of response) {
  const text = chunk.text;
  if (text) {
    res.write(text);
    acc += text;
  }
}
res.end();

void saveCoachConversation(
  {
    conversationId: "TEST-COACH",
    priorMessages: reqBody.messages,
    assistantText: acc.trim(),
  },
  req.log.child({ op: "coach.save" })
);
```

- Service (`saveCoachConversation` in `services/coach.ts`):
  - Signature: `saveCoachConversation(input: { conversationId: string; priorMessages: CoachMessage[]; assistantText: string }, logger?: Logger)`.
  - If `assistantText` is empty, no-op.
  - Build assistant message `{ id, role: "assistant", content, timestamp: new Date() }`.
  - `JSON.stringify([...priorMessages, assistantMsg])` and call `upsertCoachData({ conversationId, messages })`.
  - Catch only to `logger?.error({ err }, "coach_upsert_failed")`; do not throw (route already responded).

- Repo (`upsertCoachData`):
  - Remove `console.log` statements to comply with no-console rule; bubble DB errors as `Error`.

### Notes

- No added latency: streaming writes are immediate; save runs after response and is not awaited.
- Replace fixed `"TEST-COACH"` with request-provided `conversationId` later.

### To-dos

- [ ] Implement saveCoachConversation to append assistant and upsert
- [ ] Accumulate while streaming; call saveCoachConversation post-response
- [ ] Remove console logs from upsertCoachData