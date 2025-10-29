<!-- 95a436c3-d815-4a4e-993c-ad1876c9760e 9fe52ea0-8419-40e7-8005-a6b8a1dbf165 -->
# Improve Gemini ApiError normalization (@google/genai only)

### Scope

- Update `server/middleware/errorMiddleware.ts` to correctly handle `@google/genai` `ApiError` shape.
- Keep existing Zod handling; no route/service changes required.

### Key changes

- Detect GenAI errors via duck-typing: `err?.name === 'ApiError'` or `typeof err?.status === 'number'`.
- Extract fields directly from the error instance (no nested `error` object): `{ name, status, message }` as per `ApiError` docs.
- Do NOT strip undefined fields; log and respond with keys present even if values are undefined.
- Log compact structured details: `{ context, provider: 'google-genai', name, status, message }`.
- Respond with HTTP 502 and include the same keys consistently: `{ error: 'Upstream API error', provider: 'google-genai', name, status, message }`.

### Example extraction snippet

```ts
function pickGenaiApiError(e: any) {
  const name = typeof e?.name === 'string' ? e.name : 'ApiError';
  const status = typeof e?.status === 'number' ? e.status : undefined;
  const message = typeof e?.message === 'string' ? e.message : undefined;
  return { name, status, message };
}
```

### Tests

- Force a GenAI failure (e.g., bad API key or invalid model) and assert 502 response contains `provider: 'google-genai'` and includes `name`, `status`, and `message` keys (values may be undefined).

### To-dos

- [ ] Add normalizeUpstreamError helper in errorMiddleware.ts
- [ ] Log structured fields name/status/code/message with context
- [ ] Return 502 with normalized provider/status/code/message
- [ ] Add failing Gemini-call test ensuring fields are present