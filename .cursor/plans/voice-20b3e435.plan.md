<!-- 20b3e435-b877-405f-ac32-d0e45109087b e136f022-6c70-4083-ae26-c9f9c1be9483 -->
# Voice Agent Timer for Call Controls

### Scope

- Add an editable timer next to the call button in `client/src/components/casePractice/VoiceAgentInterface.tsx`.
- Default to 8 minutes; editable before call starts. During a call, show a read-only countdown.
- Flash visually when remaining time ≤ 60s and auto-end the call at 0.

### Files Affected

- `client/src/components/casePractice/VoiceAgentInterface.tsx`

### Implementation

- Add state:
  - `durationMinutes` (number) default 8; editable when not connected
  - `remainingSeconds` (number | null)
  - `countdownTimerId` (NodeJS.Timeout | null)
- UI layout (inline with button):
  - When NOT connected: render a compact number input (min=1, max=120) labeled visually-hidden "Timer (min)", placed in the same flex row as the phone button.
  - When connected: replace input with a small rounded badge showing `MM:SS` remaining; disable edits.
- Countdown behavior:
  - On connect: set `remainingSeconds = durationMinutes * 60` and start a 1s interval to decrement.
  - On manual end/disconnect: clear interval and reset `remainingSeconds` to null.
  - On reaching 0: clear interval and call `handleEndConversation()` once (guard against multiple triggers).
- Flashing near end (≤ 60s):
  - Apply Tailwind classes (e.g., `text-red-600 animate-pulse` on the badge) to flash without logging.
- Edge cases:
  - If the user changes `durationMinutes` while connecting, use the current value at the moment `isConnected` flips true.
  - Ensure interval cleared on unmount to avoid leaks.

### Key Snippet (formatting helper)

```ts
const formatMmSs = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};
```

### Acceptance Criteria

- Timer input (default 8) is visible next to the start button before connecting and is editable.
- On connect, countdown badge appears and decrements each second.
- Badge flashes red when ≤ 60s remain.
- Call ends automatically at 0s, invoking existing `endConversation` path.
- Manual end clears the countdown and resets UI.

### To-dos

- [ ] Add timer state and formatting helper to VoiceAgentInterface
- [ ] Render minutes input inline with call button when not connected
- [ ] Start/stop countdown on connect/disconnect; clear on unmount
- [ ] Invoke handleEndConversation automatically when remainingSeconds hits zero
- [ ] Apply flashing styles when remaining time is ≤ 60 seconds