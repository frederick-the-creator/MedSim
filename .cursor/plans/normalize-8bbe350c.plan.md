<!-- 8bbe350c-d494-4a30-99c4-595a6d23eb0e c5bf547c-5602-4486-9d48-d06fa701d2a4 -->
# Harden assessment normalizer for name‑keyed objects

### Goal

Extend the server normalizer so that when Gemini returns `dimensions` as an object keyed by display names (e.g., "Rapport, introduction, structure and flow"), it remaps them to the canonical underscore keys before validation/response. No client changes.

### Target file

- `/Users/fredericklewis/Documents/alpha_projects/MedSim/server/shared/utils/assessmentNormalize.ts`

### Change summary

- Detect if `dimensions` is an object whose keys intersect the known display names.
- Build a new object by mapping display name → canonical key using the existing `NAME_TO_KEY` map, similar to the array branch.
- Proceed with `normalizeDimension` over the remapped object so all canonical keys are populated.

### Reference (existing array branch)

```93:106:/Users/fredericklewis/Documents/alpha_projects/MedSim/server/shared/utils/assessmentNormalize.ts
if (Array.isArray(dimsRaw)) {
  const tmp: Partial<Record<(typeof DIMENSION_KEYS)[number], UnknownRecord>> = {};
  for (const d of dimsRaw) {
    // map d.name → canonical key
    const key = NAME_TO_KEY[name];
    if (!key) continue;
    tmp[key] = d as UnknownRecord;
  }
  dimsRaw = tmp as UnknownRecord;
}
```

### New logic sketch (name‑keyed object)

```typescript
if (!Array.isArray(dimsRaw) && typeof dimsRaw === 'object' && dimsRaw) {
  const keys = Object.keys(dimsRaw as Record<string, unknown>);
  const hasDisplayNames = keys.some((k) => NAME_TO_KEY[k as string]);
  if (hasDisplayNames) {
    const tmp: Partial<Record<(typeof DIMENSION_KEYS)[number], UnknownRecord>> = {};
    for (const [name, val] of Object.entries(dimsRaw as Record<string, unknown>)) {
      const key = NAME_TO_KEY[name];
      if (key) tmp[key] = (val ?? {}) as UnknownRecord;
    }
    dimsRaw = tmp as UnknownRecord;
  }
}
```

### Acceptance

- Real assessments populate `AssessmentCard` dimensions with points when mock is disabled.
- Server still returns objects that satisfy `isAssessment`.
- No changes required in client UI or hooks.

### To-dos

- [ ] Extend normalizer to remap name-keyed object to canonical keys