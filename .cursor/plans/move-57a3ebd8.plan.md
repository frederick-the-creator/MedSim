<!-- 57a3ebd8-7e14-40b6-b928-3a05e6b52079 c3325f8d-3271-495d-a4b2-bd315f14a921 -->
# Move coach util to a hook

## Goal

Move `client/src/lib/coach.ts` into a React hook under `client/src/hooks` and update usage to import from the hooks alias.

## Changes

- Create `client/src/hooks/useCoach.ts` that exposes the existing streaming function via a hook:
```startLine:endLine:client/src/lib/coach.ts
export async function postCoachAndStream(
  body: CoachRequestBody,
  onUpdate: (partialText: string) => void,
): Promise<string> {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok || !resp.body) throw new Error(`Chat error ${resp.status}`);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    onUpdate(acc);
  }
  return acc;
}
```

- Hook wrapper shape (concise):
```ts
export function useCoach() {
  async function postCoachAndStream(body: CoachRequestBody, onUpdate: (partial: string) => void) {
    // same implementation as current util
  }
  return { postCoachAndStream };
}
```

- Update `client/src/pages/casePractice.tsx` to use the hook instead of `@/lib/coach`:
  - Replace `import { postCoachAndStream } from "@/lib/coach"` with `import { useCoach } from "@/hooks/useCoach"` and add `const { postCoachAndStream } = useCoach();` inside the component.
- Remove `client/src/lib/coach.ts`.

Notes:

- Keeps API identical to minimize changes; no additional loading/error state is introduced in the hook. We can extend later if needed.
- `@hooks` is satisfied via existing alias `@` → `client/src`, using `"@/hooks/useCoach"` like other hooks in the project.

### To-dos

- [ ] Create `client/src/hooks/useCoach.ts` exposing postCoachAndStream via hook
- [ ] Update imports and usage in `client/src/pages/casePractice.tsx` to use hook
- [ ] Delete `client/src/lib/coach.ts`