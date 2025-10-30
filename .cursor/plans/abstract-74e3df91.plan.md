<!-- 74e3df91-0a91-4074-be3a-b77dba9c0bae ad6f8b92-43b3-4d87-8c0e-428aeae49354 -->
# Extract mock/real logic into two hook modules

### Overview

Create two modules under `client/src/hooks/` that each export both a real and a mock React hook, then refactor consumers to import from these modules. This removes all `MOCK_VOICE_AGENT` conditionals from components and `@/lib/assessment.ts`.

### New modules

- `client/src/hooks/useVoiceAgent.ts`
  - Exports: `useVoiceAgent`, `useVoiceAgentMock` (optionally `useVoiceAgentAuto`)
  - Real hook wraps `useConversation` and normalizes API
  - Mock hook manages connection state, speaking/listening toggles, and volumes

- `client/src/hooks/useAssessment.ts`
  - Exports: `useAssessment`, `useAssessmentMock` (optionally `useAssessmentAuto`)
  - Real hook performs POST `/api/assessment`
  - Mock hook moves current mock JSON+delay from `@/lib/assessment.ts`

### Unified return shapes

```ts
// Voice
export type VoiceAgent = {
  conversationId: string | null;
  agentState: AgentState | null; // 'talking' | 'listening' | null
  isConnected: boolean;
  isConnecting: boolean;
  getInputVolume: () => number;
  getOutputVolume: () => number;
  startConversation: (opts: { agentId: string; userId?: string }) => Promise<void>;
  endConversation: () => Promise<void>;
};

// Assessment
export type UseAssessmentResult = {
  assessment: Assessment | null;
  transcript: string | null;
  loading: boolean;
  error: string | null;
  run: (conversationId: string, medicalCase: MedicalCase) => Promise<void>;
  reset: () => void;
};
```

### Refactors

- `client/src/components/VoiceAgentInterface.tsx`
  - Replace inline checks with one import from `@/hooks/useVoiceAgent`
  - If desired, choose between real/mock at call site or provide an `Auto` hook
- `client/src/lib/assessment.ts`
  - Move mock JSON and delay into `useAssessmentMock`
  - Keep `fetchAssessment(...)` as a thin non-React helper (no env branching)

### Notes

- `@/lib/config.ts` remains the single source for `MOCK_VOICE_AGENT` and may be used by optional `Auto` hooks. Components won’t reference it directly anymore.

### To-dos

- [ ] Create client/src/lib/agentHooks.ts with four hooks and auto selectors
- [ ] Move assessment mock JSON and delay into useAssessmentMock
- [ ] Refactor VoiceAgentInterface.tsx to consume voice hook and remove checks
- [ ] Refactor assessment callers to use useAssessment or useAssessmentAuto
- [ ] Ensure shared types imported and return shapes identical across hooks
- [ ] Keep fetchAssessment thin wrapper or mark deprecated in favor of hooks