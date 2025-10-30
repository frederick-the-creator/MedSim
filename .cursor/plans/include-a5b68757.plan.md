<!-- a5b68757-5f36-48b8-8354-fce0b99d9261 c97a474b-b28a-4768-9df8-6d268c201b85 -->
# Include medicalCase in Coach payload and Gemini prompt

### Goals

- Add `medicalCase` to the coach request payload from `client/src/pages/casePractice.tsx`.
- Extend the shared coach request schema to accept `medicalCase`.
- Pass `medicalCase` through the server route and include it in the Gemini `systemInstruction`.

### Files to change

- `shared/schemas/coach.ts`
- `client/src/pages/casePractice.tsx`
- `server/features/coach/services/coach.ts`
- `server/features/coach/routes/coach.ts`

### Edits

- shared/schemas/coach.ts
  - Import `medicalCaseSchema` and extend `coachRequestSchema`:
    ```
    import { medicalCaseSchema } from "@shared/schemas/case";
    
    export const coachRequestSchema = z.object({
      messages: z.array(coachMessageSchema).max(100),
      transcript: z.string().optional().default(""),
      assessment: z.string().optional().default(""),
      medicalCase: medicalCaseSchema.optional(),
    });
    ```

- client/src/pages/casePractice.tsx
  - In `handleSendMessage`, include `medicalCase` in the request body:
    ```
    const body: CoachRequestBody = {
      messages: [...coachMessages, userMsg],
      transcript: transcript ?? "",
      assessment: assessment ? JSON.stringify(assessment) : "",
      medicalCase, // add this
    };
    ```

- server/features/coach/services/coach.ts
  - Update signature and include a CASE section in the prompt:
    ```
    export async function buildCoachSystemInstruction(
      assessment: string,
      transcript: string,
      medicalCase?: MedicalCase,
    ): Promise<string> {
      return [
        coachPersona.trim(),
        "=== CASE CONTEXT ===",
        medicalCase ? JSON.stringify(medicalCase, null, 2) : "(none provided)",
        "=== ASSESSMENT ===",
        assessment || "(none provided)",
        "=== TRANSCRIPT ===",
        transcript || "(none provided)",
      ].join("\n\n");
    }
    ```

    - If desired, we can later optimize what parts of the case to include to reduce token usage (e.g., only `vignette` and `keyFindings`).

- server/features/coach/routes/coach.ts
  - Pass the case through to the instruction builder:
    ```
    const systemInstruction = await buildCoachSystemInstruction(
      body.assessment ?? "",
      body.transcript ?? "",
      body.medicalCase,
    );
    ```


### Notes

- No changes needed in `client/src/lib/coach.ts` beyond typing, since it serializes the body as JSON.
- The Gemini model remains `gemini-2.0-flash` as-is.
- We can later refine the CASE block to a smaller, intent-focused summary if prompt size becomes an issue.

### To-dos

- [ ] Extend coachRequestSchema to accept optional medicalCase
- [ ] Send medicalCase in CasePractice handleSendMessage body
- [ ] Include medicalCase in buildCoachSystemInstruction CASE section
- [ ] Pass body.medicalCase to buildCoachSystemInstruction in coach route