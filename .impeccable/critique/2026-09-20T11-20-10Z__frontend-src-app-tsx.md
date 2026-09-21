---
target: frontend/src/App.tsx
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\tomra\\Documents\\board-game-picker-commercial\\frontend\\src\\App.tsx"
target_fingerprint: "sha256:7fc0a05efd439c73d170f6fe854bf884b7efd51cf26c556a02bc4114b46f75c8"
target_path: "C:\\Users\\tomra\\Documents\\board-game-picker-commercial\\frontend\\src\\App.tsx"
timestamp: 2026-09-20T11-20-10Z
slug: frontend-src-app-tsx
---
# ShelfPick Interface Critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Strong feedback; Picker progress hides branching depth. |
| 2 | Match between system and real world | 4 | Language closely matches hobbyist decisions. |
| 3 | User control and freedom | 3 | Discover dismissal has no undo. |
| 4 | Consistency and standards | 3 | Coherent tokens; older login captures suggest possible palette drift. |
| 5 | Error prevention | 3 | Advanced filters can silently overconstrain. |
| 6 | Recognition rather than recall | 3 | Interacting constraints require memory. |
| 7 | Flexibility and efficiency | 3 | No visible recent groups or saved setups. |
| 8 | Aesthetic and minimalist design | 3 | Calm hierarchy; desktop auth leaves excessive empty space. |
| 9 | Error recovery | 3 | Good retry paths; dismissals cannot be recovered. |
| 10 | Help and documentation | 2 | First-run guidance and trust information are thin. |
| **Total** | | **30/40** | **Good foundation with focused product friction** |

## Design Specificity Verdict

ShelfPick is moderately high in specificity. Forest & Gold, Lora and Nunito Sans, the bounded shelf, board-game language, cover-led content and explainable recommendations form a coherent identity. Picker and Discover feel authored for ShelfPick; Auth and generic card/list patterns are less distinctive.

The detector returned zero findings for frontend/src/App.tsx. Fresh browser tab creation timed out before mutation preflight, so no live overlay or current browser evidence was available.

## Overall Impression

ShelfPick feels warm, deliberate and trustworthy. The biggest opportunity is making the path to a confident pick as immediate as the promise: clarify Picker versus Game Night, reduce repeat setup, and use first-run surfaces to earn trust.

## What's Working

- Product language closely matches real game-night decisions.
- Validation, retries, pending guards and no-match recovery are thoughtful.
- The visual system is coherent across color, type, surfaces and motion.

## Priority Issues

### [P1] Picker and Game Night compete as mental models
Why it matters: Both are peer destinations while Picker already asks who is playing.
Fix: Give Game Night a clearly distinct group-session purpose or merge overlapping entry points; add a one-tap recent group.
Suggested command: $impeccable shape

### [P1] The path to a pick asks for too many decisions up front
Why it matters: Friends, six group sizes, complexity and Advanced appear before time.
Fix: Lead with a recent group or minimal player/time setup; summarize active optional filters.
Suggested command: $impeccable distill

### [P2] First-run trust is too abstract
Why it matters: Registration does not explain imports, privacy expectations or what happens next.
Fix: Add concise reassurance and preview the import-to-recommendation loop.
Suggested command: $impeccable onboard

### [P2] Discover actions lack local recovery
Why it matters: Not interested removes a card without undo and wishlist failures surface away from the card.
Fix: Add inline Undo and local save/error feedback.
Suggested command: $impeccable harden

### [P3] Wide-screen auth composition feels unfinished
Why it matters: The reviewed 1440px capture leaves most of the viewport empty around a 390px shell.
Fix: Keep the form compact and use a deliberate second region for product proof; verify live first.
Suggested command: $impeccable layout

## Persona Red Flags

Jordan, first-time user: Picker and Game Night are not self-explanatory, hobby terminology lacks visible help, and registration gives little preview of setup.

Casey, distracted mobile user: Touch targets are favorable, but a long Picker screen and nested substeps create interruption risk; draft-state persistence was not established.

Morgan, repeat game-night host: Deterministic reasons fit well, but no visible recent or saved setups adds repeat work and broad match labels can feel opaque.

## Minor Observations

- Empty player search promises adding someone without an add action on the inspected surface.
- Progress dots lack visible stage labels.
- Title-only picker guidance is unreliable on touch.
- Current theme parity and live login action color need fresh verification.

## Questions to Consider

- Why is a regular group with familiar constraints not the first one-tap choice?
- Are Picker and Game Night different mental models, or exposed product architecture?
- What proof should appear before users share years of collection history?
- Could the recommendation reveal become the unmistakable emotional peak?
- Does the 390px shelf communicate premium focus on desktop or an unfinished mobile wrapper?
