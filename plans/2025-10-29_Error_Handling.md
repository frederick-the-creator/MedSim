<!-- 785c84eb-27c2-446c-881f-863b2020b473 f6eb7cf9-c9be-4afc-8e84-5dc0e8c62e0f -->
# Centralize Gemini error handling (no try/catch)

### Goal

Use Express 5's async error propagation to avoid try/catch in routes/services. Detect and shape Google GenAI (Gemini) errors centrally in `errorMiddleware.ts`, and add lightweight context tagging for clearer logs and responses.

### Approach

- **Rely on Express 5**: Let async rejections/throws bubble to the error middleware—no try/catch in route/service code required.
- **Gemini-aware error shaping** in `server/middleware/errorMiddleware.ts`:
  - Add a type guard for Google GenAI ApiError (`name === "ApiError"` or presence of `err.error.{code,status,message}`).
  - Log structured details with a route context tag.
  - Respond with a sanitized body: `{ error: "Upstream API error", provider: "google-genai", code, status, message }` and status `502`.
- **Context tagging**: Set `res.locals.context` at the start of key routes (e.g., `assessment.generate`, `coach.stream`) so the middleware can include it in logs without try/catch.
- **Cursor rules**: Add a workspace `.cursorrules` to encode error-handling policy (prefer middleware over try/catch, structured logging, status mapping, and route context usage) to guide future edits.

### Key Edits

- `server/middleware/errorMiddleware.ts`
  - Insert Gemini-specific handling before the generic `Error` branch.
  - Example snippet (concise illustration):
```ts
// before: if (err instanceof Error) { ... }
const e = err as any;
const isGeminiApiError =
  e?.name === "ApiError" || (e?.error && typeof e.error?.message === "string");
if (isGeminiApiError) {
  const { code, status, message } = e.error ?? {};
  console.error("[errorMiddleware] Gemini API error", {
    context: res.locals?.context,
    status,
    code,
    message,
  });
  res.status(502).json({
    error: "Upstream API error",
    provider: "google-genai",
    code,
    status,
    message,
  });
  return;
}
```

- `server/features/assessment/routes/assessment.ts`
  - At route start: `res.locals.context = "assessment.generate";`
- `server/features/coach/routes/coach.ts`
  - At route start: `res.locals.context = "coach.stream";`
- `.cursorrules` (workspace root)
  - Add guidance for contributors/tools:
```
# Error Handling Rules

- Use Express 5 async propagation; avoid try/catch in routes/services unless strictly required.
- Normalize all upstream API errors in server/middleware/errorMiddleware.ts.
- When calling Google GenAI (Gemini), do not catch; let errors bubble, log provider/code/status/message in middleware.
- Set res.locals.context in routes (e.g., "assessment.generate", "coach.stream") for structured logging.
- Do not leak secrets in logs or responses; prefer 502 for upstream failures.
```


### Notes

- This keeps services like `assessWithGemini` throw-only; no try/catch required.
- We avoid leaking secrets and still surface actionable fields (provider/code/status/message).
- If desired later, we can introduce a `GeminiError extends Error` class and a small helper to normalize non-Error throws, but it’s not required for Express 5.

### To-dos

- [ ] Add Gemini-specific handling in `server/middleware/errorMiddleware.ts`
- [ ] Set `res.locals.context` in `server/features/assessment/routes/assessment.ts`
- [ ] Set `res.locals.context` in `server/features/coach/routes/coach.ts`
- [ ] Add a test asserting 502 with provider/code/status/message on Gemini failure
- [ ] Create `.cursorrules` with error-handling policy (middleware-first, no try/catch)