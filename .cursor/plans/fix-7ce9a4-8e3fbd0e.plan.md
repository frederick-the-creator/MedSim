<!-- 8e3fbd0e-f5b1-46ee-8cc9-745dec3f1532 63559505-d736-406b-ba8d-ab94fa14586b -->
# Fix mock voice agent: stop immediate disconnect in mock mode

## Summary

Clicking start in mock mode briefly shows the end button then flips back because the `useEffect` cleanup in `useVoiceAgentMock` depends on `isConnected` and unconditionally resets state during dependency changes. We’ll move the effect to run only on unmount and remove state updates from cleanup.

## Target files

- `client/src/hooks/useVoiceAgent.ts`

## Key change

- In `useVoiceAgentMock`, change the `useEffect` dependency array to `[]` (run once) and remove `setIsConnected`/`setIsSpeaking` calls from the cleanup to avoid resetting during re-renders/unmount.

### Current (for context)

```166:179:client/src/hooks/useVoiceAgent.ts
useEffect(() => {
	return () => {
		if (speakingIntervalRef.current) {
			window.clearInterval(speakingIntervalRef.current);
			speakingIntervalRef.current = null;
		}
		if (isConnected) {
			notifyEndOnce(conversationIdRef.current);
		}
		setIsConnected(false);
		setIsSpeaking(false);
		conversationIdRef.current = null;
	};
}, [isConnected]);
```

### Proposed

```ts
useEffect(() => {
  return () => {
    if (speakingIntervalRef.current) {
      window.clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }
    if (conversationIdRef.current) {
      notifyEndOnce(conversationIdRef.current);
      conversationIdRef.current = null;
    }
  };
}, []);
```

## Validation

- In `VITE_MOCK_VOICE_AGENT=true`, click start: end-call button stays visible; orb alternates talking/listening; conversation ID shows.
- Click end: returns to start state, `onConversationEnd` fires once.
- Unmount while connected: interval cleared, `onConversationEnd` called once, no state updates on unmounted component.

## Notes

- Ensure `.env.local` has `VITE_MOCK_VOICE_AGENT` set to the string `true` (Vite envs are strings).

### To-dos

- [ ] Update mock hook cleanup effect to run only on unmount and remove state updates
- [ ] Manually test start/end flow in mock mode for flicker regression
- [ ] Verify .env.local uses string 'true' for VITE_MOCK_VOICE_AGENT