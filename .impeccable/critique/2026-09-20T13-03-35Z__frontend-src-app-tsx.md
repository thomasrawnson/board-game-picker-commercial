---
target: Pick vs Game Night approved IA
total_score: 15
max_score: 20
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\tomra\\Documents\\board-game-picker-commercial\\frontend\\src\\App.tsx"
target_fingerprint: "sha256:7fc0a05efd439c73d170f6fe854bf884b7efd51cf26c556a02bc4114b46f75c8"
target_path: "C:\\Users\\tomra\\Documents\\board-game-picker-commercial\\frontend\\src\\App.tsx"
timestamp: 2026-09-20T13-03-35Z
slug: frontend-src-app-tsx
---
# Pick vs Game Night implementation critique

## Design Health Score

| Area | Score | Finding |
|---|---:|---|
| Product-model clarity | 2/4 | Game Night is a primary destination despite being Coming Soon. |
| Pick scope discipline | 4/4 | Pick remains an immediate deterministic flow without shared-group state. |
| Information hierarchy | 3/4 | Complexity is visible and secondary controls are grouped, but labels imply advanced and persistent-group semantics. |
| Navigation consistency | 2/4 | The approved four-item IA conflicts with current five-item navigation and DESIGN.md. |
| Implementation safety | 4/4 | The minimum correction is frontend-only and preserves routes, APIs, and recommendation behavior. |
| **Total** | **15/20** | **Structurally close; navigation and copy need alignment.** |

## Priority Issues

### P1: Game Night is a primary dead-end
Remove it from the primary nav while retaining the protected /game-night preview route.

### P2: Pick copy implies persistent groups
Rename Choose friends / regular group language to specific-player, one-off recommendation language.

### P2: DESIGN.md mandates five navigation targets
Update the design contract to four working destinations when implementation lands.

### P3: Advanced options conflicts with approved Fine-tune language
Rename the existing disclosure; the controls are already grouped correctly.

## Smallest Safe Slice

- AppNavigation.tsx: Picker label to Pick; remove Game Night nav item.
- navigation.css: five columns to four.
- PlayerStep.tsx: Fine-tune label and one-off player copy.
- DESIGN.md and PRODUCT.md: align current navigation and user-facing naming.
- Keep App.tsx, routes.ts, PickerView, TimeStep, API, backend, and database behavior unchanged.

## Data Impact

No migration, backend model, API schema, or recommendation-engine change is required.

## Recommended Order

1. Navigation item and label.
2. Four-column nav layout.
3. Pick copy.
4. Design/product documentation.
5. Existing frontend checks and manual light/dark mobile/desktop verification.
6. Direct-link verification for the retained Coming Soon route.
