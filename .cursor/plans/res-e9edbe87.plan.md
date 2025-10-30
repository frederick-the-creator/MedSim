<!-- e9edbe87-5a80-4d12-9702-dca1cc26699c fd516611-40d2-4783-b7fe-3af580b6fad5 -->
# Graceful assessment failure dialog

## What we'll do

- Keep `assessment` strictly `Assessment | null`; set it to null on failure.
- Introduce a single reusable `MessageDialog` component for both loading and error.
- No retry flow and no extra inline UI; close loading dialog as today.
- Ensure the assessment/coach section renders only when `assessment` is non-null.

## Files to change/add

- Add `client/src/components/MessageDialog.tsx`
- Edit `client/src/pages/casePractice.tsx`
- (Optional) Wrap old components to use `MessageDialog` for backward compatibility

## Edits (essential snippets)

- Create a reusable dialog component:
```tsx
// client/src/components/MessageDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MessageDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  showSpinner?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export default function MessageDialog({
  open,
  onOpenChange,
  title,
  description,
  showSpinner,
  actionLabel,
  onAction,
}: MessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {showSpinner && (
          <div className="flex items-center justify-center py-10">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
              aria-label="loading"
            />
          </div>
        )}
        {actionLabel && (
          <div className="mt-4 flex justify-end">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- Add error state in `casePractice.tsx`:
```tsx
const [assessmentError, setAssessmentError] = useState<string | null>(null);
const [isErrorOpen, setIsErrorOpen] = useState(false);
```

- Update fetch error handling in `handleEndConversation`:
```tsx
} catch (e: any) {
  setAssessment(null);
  setTranscript(null);
  setAssessmentError(e?.message ?? "Failed to generate assessment.");
  setIsErrorOpen(true);
} finally {
```

- Render dialogs near the bottom of the page:
```tsx
// Loading
<MessageDialog
  open={isAssessmentLoading}
  onOpenChange={(open) => !open && setIsAssessmentLoading(false)}
  title="Generating assessment…"
  showSpinner
/>

// Error
<MessageDialog
  open={isErrorOpen}
  onOpenChange={setIsErrorOpen}
  title="Assessment failed"
  description={assessmentError || "Something went wrong. Please try again later."}
  actionLabel="OK"
  onAction={() => setIsErrorOpen(false)}
/>
```

- Keep assessment section guarded (already present):
```tsx
{assessment && (
  <div ref={secondRowRef} className="mt-8">
    <TwoColumnRow ... />
  </div>
)}
```


## Acceptance criteria

- On failure: loader closes; an OK-only dialog appears with a clear message.
- Clicking OK dismisses the dialog; no assessment/coach section is rendered.
- On success with `assessment: null`: nothing renders for the assessment section, no dialog shown.
- No crashes and types remain correct.

### To-dos

- [ ] Create `MessageDialog` component using Dialog primitives
- [ ] Refactor `casePractice.tsx` to use `MessageDialog` for loading and error
- [ ] Deprecate old `AlertMessageDialog` and `AssessmentDialog` (wrap or remove if unused)