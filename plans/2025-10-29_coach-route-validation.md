<!-- 26013390-9c6d-47c7-bb9f-1e891184fec6 bba2045b-f6ca-49ab-ad1e-9c27a066b817 -->

# Refactor Coach Route Validation

### Goal

Centralize the coach route request validation by:

- Creating `shared/schemas/coach.ts` with a Zod schema for the coach request
- Adding a `parseCoachRequestBody` helper in `server/shared/utils/validation.ts`
- Updating `server/features/coach/routes/coach.ts` to use the helper

### Files to Change

- Create: `shared/schemas/coach.ts`
- Update: `server/shared/utils/validation.ts`
- Update: `server/features/coach/routes/coach.ts`
- Update: `client/src/lib/chat.ts`

### Key Edits

- `shared/schemas/coach.ts`: Export `coachMessageSchema`, `coachRequestSchema`, and `CoachRequestBody`.
- `server/shared/utils/validation.ts`: Import `coachRequestSchema`; export `CoachRequestBody` type and `parseCoachRequestBody(body)`.
- `server/features/coach/routes/coach.ts`: Remove inline Zod schema; import and call `parseCoachRequestBody` to obtain `body`.
- `client/src/lib/chat.ts`: Import `CoachRequestBody` from `@shared/schemas/coach`; type `postChatAndStream(body: CoachRequestBody)` and `ChatMessage = CoachRequestBody["messages"][number]`.

### Snippets

- Schema shape (non-executable excerpt):
- messages: array of { role: "user"|"assistant", content: string ≤ 8000 } (max 100)
- transcript: optional string default ""
- assessment: optional string default ""

### To-dos

- [ ] Create coach request schema in shared/schemas/coach.ts
- [ ] Add parseCoachRequestBody to server/shared/utils/validation.ts
- [ ] Update server/features/coach/routes/coach.ts to use helper
- [ ] Update client/src/lib/chat.ts to use shared schema types
