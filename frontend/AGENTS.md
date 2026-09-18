# ShelfPick frontend

Applies to `frontend/`. Read backend instructions too when changing that side.
Keep changing roadmap priorities outside this file.

## Implementation

- Use the existing React, TypeScript, Vite and PWA architecture. Inspect current components and preserve unrelated changes; keep work within the requested slice.
- Use ShelfPick in visible product copy. Preserve internal names and API identifiers unless the task requires changing them.
- Preserve the green, cream and gold identity. Reuse existing semantic tokens and components; edit definitive style rules instead of accumulating late overrides or `!important` declarations.
- Maintain comfortable mobile, tablet and desktop layouts. Dense screens may use wider layouts; authentication and guided Picker flows can remain narrow.
- Keep navigation reachable, respect safe-area insets, and prevent controls from covering content. Preserve direct routes, browser history and existing game-detail entry points.
- Aim for 16px primary body text, at least 14px controls/supporting text and 12px metadata. Smaller overlines must be nonessential. Give standalone actions a 44px effective touch target without enlarging the icon unnecessarily.
- Use semantic controls, accessible names, associated field errors, visible keyboard focus, readable contrast and reduced-motion support.
- Distinguish loading, empty, error and expired-session states. Preserve useful content and user selections during retry; prevent indefinite loading and duplicate submissions.
- Roll back failed optimistic updates. Do not automatically retry mutations that may duplicate work.
- Keep backend validation authoritative. Never store passwords or secrets in browser storage or logs; frontend build-time variables are public.
- Preserve Picker suitability rules, wishlist/ownership separation and user-scoped data. Coordinate backend contract changes explicitly.

## Development checks

- Use existing dependencies and test tooling. Add focused tests for meaningful behaviour changes, not assertions that merely mirror CSS declarations.
- Run `npm run lint` and `npm run build` from `frontend/` for code/style changes. Run relevant interaction/routing tests for changed behaviour and PWA checks when affected.
- For layout changes, inspect the affected screens at 390, 768, 1024 and 1440px where browser tooling is available. Check keyboard access, zoom and populated/empty/error states as relevant.
- Clearly distinguish fixtures and mocked requests from live-backend verification. Report unavailable visual checks rather than claiming a build proves layout correctness.
- For complete release validation, use `.agents/skills/shelfpick-release-check/SKILL.md` from the repository root rather than duplicating its checklist here.

## Completion

Update documentation affected by behaviour changes. Report what changed, validation and material limitations. Do not commit, push, deploy or change external resources unless requested. Preserve unrelated work.
