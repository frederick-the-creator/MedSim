<!-- dc49e0cf-ce93-4331-8e38-d18996a1b63f 2f8ca1c0-6689-4c18-aa68-7443f5552baf -->
# Unify voice end callback in hook

## What we’ll change

- Centralize end-of-session notification in `client/src/hooks/useVoiceAgent.ts` with a required `onConversationEnd` callback option.
- Ensure the callback fires exactly once per session (manual hangup or remote/network disconnect), guarded by a ref.
- Mirror the behavior in `useVoiceAgentMock` and thread the option through `useVoiceAgentAuto`.
- Update `client/src/components/casePractice/VoiceAgentInterface.tsx` to pass the `onEndConversation` prop into the hook and remove the manual callback invocation in `handleEndConversation`.

## Key edits

- In `client/src/hooks/useVoiceAgent.ts` add:
```ts
export type UseVoiceAgentOptions = {
  onConversationEnd: (conversationId: string | null) => void;
};

export function useVoiceAgent(options: UseVoiceAgentOptions): VoiceAgent {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endNotifiedRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);

  const notifyEndOnce = (id: string | null) => {
    if (endNotifiedRef.current) return;
    endNotifiedRef.current = true;
    options.onConversationEnd(id);
  };

  const conversation = useConversation({
    onConnect: () => {},
    onDisconnect: () => {
      notifyEndOnce(conversationIdRef.current);
      setConversationId(null);
      conversationIdRef.current = null;
    },
    onMessage: () => {},
    onError: () => {},
  });

  const startConversation = async (opts: { agentId: string; userId?: string }) => {
    const id = await conversation.startSession({
      agentId: opts.agentId,
      connectionType: "websocket",
      userId: opts.userId ?? "fixed-user-12345",
      clientTools: {},
    });
    conversationIdRef.current = id;
    endNotifiedRef.current = false;
    setConversationId(id);
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } finally {
      notifyEndOnce(conversationIdRef.current);
      setConversationId(null);
      conversationIdRef.current = null;
    }
  };

  // ... return VoiceAgent with computed state and volume getters
}
```

- Update `useVoiceAgentMock(options: UseVoiceAgentOptions)` similarly: maintain `conversationIdRef`, set `endNotifiedRef=false` on start; call `notifyEndOnce(conversationIdRef.current)` when ending or on cleanup.

- Update `useVoiceAgentAuto(options: UseVoiceAgentOptions)` to forward options to real/mock and return the chosen instance.

- In `client/src/components/casePractice/VoiceAgentInterface.tsx`:
  - Initialize the hook: `const voiceAgent = useVoiceAgentAuto({ onConversationEnd: onEndConversation });`
  - Simplify `handleEndConversation` to only call `await voiceAgent.endConversation();` (remove manual `onEndConversation?.(id)` call).

## Notes

- Guarantees a single assessment run per session end, regardless of termination path.
- Since `onConversationEnd` is required, no fallback or conditional access is used.

### To-dos

- [ ] Add UseVoiceAgentOptions with onConversationEnd to hook
- [ ] Implement one-time end callback and guard in useVoiceAgent
- [ ] Mirror one-time end callback in useVoiceAgentMock
- [ ] Forward options in useVoiceAgentAuto to real/mock
- [ ] Wire VoiceAgentInterface to pass onEndConversation to hook and remove manual call