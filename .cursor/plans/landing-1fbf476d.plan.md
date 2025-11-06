<!-- 1fbf476d-e838-47dd-95a3-a96f7e5d71b7 a78e6602-87d3-481d-8ef5-a0d05945912e -->
# Landing Page and Routing Update

## Goal

Create a responsive Landing page at `/` with sections: Header, Tagline, Video, Sign-up grid, FAQ. Move current Home to `/home`. Reuse existing `Header` and `Accordion`.

## Files to Add / Edit

- Add `client/src/pages/landing.tsx` – new landing page composed of blocks with consistent containers (`max-w-7xl mx-auto px-4`).
- Add `client/src/components/landing/SignupCard.tsx` (or inline) – card for each discipline with visual states.
- Add `client/src/data/disciplines.ts` – source-of-truth list of disciplines and CTA labels.
- Edit `client/src/App.tsx` – route `/` → `Landing`, route `/home` → existing `Home` (keep `/case/:id`).

## Section Details

- Header: reuse `components/shared/Header`.
- Tagline: centered block with responsive typography.
- Video: responsive 16:9 wrapper, embedded YouTube iframe; lazy-load and maintain aspect ratio to avoid CLS. Video: [`https://www.youtube.com/watch?v=ZK-rNEhJIDs`](https://www.youtube.com/watch?v=ZK-rNEhJIDs).
- Sign-up grid: same container and grid as "Select a Case Study" (e.g., `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - Ophthalmology ST1: normal/primary styling, button text "Sign up".
  - Others: slightly greyed (`opacity-70` or muted background) but still clickable, button text "Register interest". No actual action yet.
- FAQ: use `components/ui/accordion.tsx` with ~5 placeholder items.

## Routing Change (essential snippet)

Replace current root route and add `/home`:

```tsx
// client/src/App.tsx
<Switch>
  <Route path="/" component={Landing} />
  <Route path="/home" component={Home} />
  <Route path="/case/:id" component={CasePractice} />
  <Route component={NotFound} />
</Switch>
```

## Responsive/Mobile Strategy

- Containers: `max-w-7xl mx-auto px-4`; vertical rhythm via `py-16` per block; clear headings.
- Grid breakpoints: 1/2/3 columns at `sm/md/lg`. Ensure consistent card heights and wrap.
- Video: aspect-ratio wrapper (e.g., `aspect-video`) with iframe set to `w-full h-full` and `loading="lazy"`.
- Tap targets: min 44px height for buttons, adequate spacing; avoid hover-only cues; add focus-visible rings.
- Accessibility: proper headings (`h1` for tagline), `aria-label` for buttons, keyboard navigable Accordion.
- Performance: defer iframe loading until in-view (optional), lightweight hero; reuse existing styles.

## Data: Disciplines

Create `client/src/data/disciplines.ts` with an array including all provided disciplines; mark Ophthalmology as `primaryCta`:

- Internal Medicine Training
- Core Surgical Training
- Anaesthetics CT1 / ACCS
- Cardiothoracic Surgery ST1
- CSRH ST1
- Emergency Medicine ACCS
- GP Selection Centre
- Histopathology ST1
- Neurosurgery ST1
- Obs and Gynae ST1
- Ophthalmology ST1 (primary: "Sign up")
- Paediatrics ST1
- Public Health Medicine ST1
- Radiology ST1
- Academic Clinical Fellowship

## Placeholder Behavior (per your decision)

- Buttons do nothing for now. Keep them clickable for all cards; no navigation or side effects yet.

## Follow-ups (later)

- Wire "Sign up" and "Register interest" flows.
- Add video poster/fallback and analytics events.
- SEO: meta tags for landing, structured data if needed.

### To-dos

- [ ] Create `client/src/pages/landing.tsx` with Header, Tagline, Video, Signup grid, FAQ
- [ ] Add `client/src/data/disciplines.ts` listing disciplines and CTA label flags
- [ ] Create `client/src/components/landing/SignupCard.tsx` to render discipline cards
- [ ] Map disciplines into grid with visual states and no-op buttons
- [ ] Update `client/src/App.tsx` to route `/` to Landing and `/home` to Home
- [ ] Ensure headings, focus styles, aria labels, and keyboard navigation