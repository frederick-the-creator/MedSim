<!-- 5bed8d4d-dc80-45f4-965b-3186d93cdc7a f565f38f-92f4-4a1e-b97c-636a9fc5fbca -->
# Refactor: Extract handler functions in CasePractice

## Goal

Extract the inline functions currently defined in `onEndConversation` and `onSendMessage` props into named handler functions within the `CasePractice` component, preserving logic and types.

## Scope

- File: `client/src/pages/casePractice.tsx`

## Changes

- Define two handlers inside the `CasePractice` component (above the JSX return):
  - `handleEndConversation(conversationId?: string): Promise<void>`
  - `handleSendMessage(text: string): Promise<void>`
- Move existing logic from the inline callbacks into these handlers without changing behavior.
- Replace JSX props to reference the new handlers.
- Optional: wrap handlers with `useCallback` to stabilize references.

## Key Edits (illustrative)

- Handler definitions:
```ts
const handleEndConversation = async (conversationId?: string) => {
  if (!conversationId) return;
  try {
    setIsAssessmentLoading(true);
    const result = await fetchAssessment(conversationId, medicalCase);
    setAssessment(result.assessment);
    setTranscript(result.transcript);
  } catch (e: any) {
    setAssessment(e?.message ?? "Assessment failed");
  } finally {
    setIsAssessmentLoading(false);
  }
};

const handleSendMessage = async (text: string) => {
  const userMsg: CoachMessage = {
    id: `${Date.now()}`,
    role: "user",
    content: text,
    timestamp: new Date(),
  };
  setCoachMessages((prev) => [...prev, userMsg]);
  const assistantId = `${Date.now()}-assist`;
  setCoachMessages((prev) => [
    ...prev,
    { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
  ]);
  setIsChatLoading(true);
  try {
    const body: CoachRequestBody = {
      messages: [...coachMessages, userMsg],
      transcript: transcript ?? "",
      assessment: assessment ? JSON.stringify(assessment) : "",
    };
    await postCoachAndStream(body, (acc: string) => {
      setCoachMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
    });
  } catch (e) {
    const errText = (e as any)?.message || "Chat failed";
    setCoachMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: errText } : m)));
  } finally {
    setIsChatLoading(false);
  }
};
```

- JSX usage:
```tsx
<VoiceAgentInterface
  patientName={medicalCase.vignette.background.patientName}
  agentId={medicalCase.agentId}
  onEndConversation={handleEndConversation}
/>

<CoachInterface
  messages={coachMessages}
  onSendMessage={handleSendMessage}
  isLoading={isChatLoading}
/>
```

### To-dos

- [ ] Define handler functions in casePractice.tsx for end conversation and send message
- [ ] Replace inline prop callbacks with handler references in JSX
- [ ] Memoize handlers with useCallback and correct dependencies