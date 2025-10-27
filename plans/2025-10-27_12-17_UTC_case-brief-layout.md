# Two-row layout with hoisted assessment (delivered in vertical slices)

## Scope

Restructure `client/src/pages/case-detail.tsx` into two stacked rows using a shared two-column layout component. Hoist the assessment and loading dialog state into `case-detail.tsx`. Add a dedicated assessment dialog component. Finally, add the second row: assessment (left) and chat (right).

## Delivery Slices

### Vertical 1: Layout foundation

- Add `TwoColumnRow` layout component taking `left` and `right` props.
- Update `case-detail.tsx` to render the first row with `CaseBrief` (left) and `VoiceAgentInterface` (right) using `TwoColumnRow`.
- Make `CaseBrief` more compact (smaller spacing/typography).

### Vertical 2: Hoist assessment and dialog

- Add non-optional `AssessmentDialog.tsx` that shows a centered spinner while loading and supports open/close props.
- Refactor `VoiceAgentInterface.tsx` to:
  - Remove the "Tip: Feedback Mode" card.
  - Minimize internal logic related to assessment and dialog.
  - Expose an `onEndConversation(conversationId: string | null)` callback to let the parent trigger assessment fetching.
- In `case-detail.tsx`, manage assessment state: `isAssessmentLoading`, `assessment`, and show `AssessmentDialog` while loading.

### Vertical 3: Second row (assessment + chat)

- Add a second `TwoColumnRow` below the first:
  - Left: Assessment display (plain pre-wrapped text initially)
  - Right: `ChatInterface` component
- When assessment resolves in `case-detail.tsx`, auto-scroll to the second row using a `ref` and `scrollIntoView({ behavior: 'smooth' })`.

## Files to Add/Change

- Add `client/src/components/layout/TwoColumnRow.tsx`
- Add `client/src/components/AssessmentDialog.tsx`
- Update `client/src/pages/case-detail.tsx`
- Update `client/src/components/CaseBrief.tsx` (compact styling)
- Update `client/src/components/VoiceAgentInterface.tsx`

## Notes

- Keep assessment as a simple string for now; can later map to `FeedbackDisplay` if we adopt a structured shape.
- The mock mode in `VoiceAgentInterface` remains, but assessment triggering is delegated to the parent.
