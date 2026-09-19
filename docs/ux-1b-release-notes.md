# ShelfPick UX-1B release notes

Date: 2026-09-19

## Outcome

Implemented recoverable requests, accessible registration/password reset, and bounded tablet/desktop layouts. Local automated release validation passed. Browser interaction checks used synthetic data and intercepted requests, not live accounts or production services.

Foundation B production verification remains the next roadmap priority.

## Findings before editing

- Session restoration cleared the saved token on every failure, including network errors.
- Collection and Discover had no explicit loading retry. Picker options/player failures could resemble empty results; generic errors hid the reason for failure.
- Requests had no client deadline, including response-body reads.
- Registration lacked password visibility and associated field errors; submission relied on rendered disabled state alone.
- Dense screens shared the narrow phone frame.

Work stopped when overlapping changes appeared. The user then explicitly approved continuing against that new baseline. The updated two-step Picker, Collection Ranking tab, legacy `/rankings` redirect, Insights changes and other existing edits were preserved. Recovery was integrated again where those edits had replaced it.

## Implementation

- `src/api/request.ts`, `src/api/client.ts`: shared bounded requests (30 seconds normally, 120 seconds for sync/import), including stalled response bodies; readable connection errors; explicit session-expired errors for authenticated 401 responses; safe backend field-error mapping. Mutations are never automatically replayed. Timeout copy acknowledges that a write may have completed.
- `src/App.tsx`: failed restoration retains the token and intended route with retry or explicit login; genuine expiry has separate messaging. Dense destinations receive the wider frame; authentication and Picker remain narrow.
- `CollectionView`, `DiscoverView`, `WishlistView`, `PickerView`, `PlayerSelectionStep`: explicit recovery controls, retained selections/content, and loading guards. Collection does not redirect a deep link merely because loading failed. Failed Discover optimistic saves roll back. Want to Play retains its list during retry.
- `SetupView`: sync/import submission locks, retained inputs and previous results, explicit retry labels and correctly qualified previous-success messages.
- `AuthView`, `ResetPasswordView`, `ui/PasswordField`, `auth-validation.ts`: shared show/hide control; associated labels, hints, `aria-invalid` and field-specific errors; focus on invalid fields; retained failed-submission input; synchronous duplicate-submission guards. Passwords accept 8–128 Unicode characters, matching backend policy, without invented composition requirements. Backend validation remains authoritative.
- `ui/RetryNotice`, `styles/auth.css`, `styles/ui.css`, `styles/commercial.css`: reusable recovery presentation, password layout and bounded wider frames. Collection/Want to Play and Discover use two columns where space permits. Rankings artwork is capped at 260px on wider screens. No late `!important` overrides or new design system.
- `package.json`, request/validation tests and `routes.test.ts`: focused recovery/policy tests, plus updated expectations for the approved Collection Ranking navigation.

Paths above are relative to `frontend/`. No backend code, API contracts or migrations were changed. Internal legacy identifiers remain unchanged; no visible legacy product names were introduced.

## Automated release validation

Used `.agents/skills/shelfpick-release-check/SKILL.md`.

The resolved Python executable was `C:\Users\tomra\Documents\board-game-picker-commercial\backend\.venv\Scripts\python.exe`. Its sandbox launch initially reported `Unable to create process using ...Python312\python.exe`. The same executable worked outside the sandbox after approval; no interpreter, environment or dependency was replaced. Database configuration was verified without credentials: development environment, PostgreSQL on localhost, database `boardgamepicker_commercial`. Tests use local development data and isolated SQLite fixtures; Alembic targets the same development schema. Database checks ran sequentially and no migrations were applied.

| Directory | Command | Exit | Result |
| --- | --- | --- | --- |
| `backend` | absolute repository Python `-m pytest` | 0 | 182 passed; one existing Starlette/httpx deprecation warning |
| `backend` | absolute repository Python `-m alembic check` | 0 | No new upgrade operations |
| `frontend` | `npm test` | 0 | 9 passed |
| `frontend` | `npm run lint` | 0 | Passed |
| `frontend` | `npm run build` | 0 | TypeScript, Vite and PWA generation passed |
| `frontend` | `npm run check:pwa` | 0 | Manifest icons valid against the successful current build |
| repository | `git diff --check` | 0 | Passed |

Backend results remain applicable: the approved overlapping edits were frontend-only. Frontend tests/lint/build/PWA were rerun after integration. An initial route test failed because it expected Rankings as a separate navigation destination; it now verifies the approved Collection destination and ranking path. An initial lint error about error causes was fixed.

## Browser verification

Used the actual React application with a temporary localhost fixture intercepting API requests. No live accounts were registered, passwords changed, BGG collections synced or user data removed. The fixture and task dev server were removed/stopped after verification.

Verified:

- Authentication network failure → retry → original Collection route; 401 → explicit expired-session login message; a real 30-second stalled mock request → timeout notice → successful retry.
- Collection load failure → retry → populated list, including after integrating the Ranking tab.
- Discover load failure → retry → recommendations.
- Want to Play load failure → retry → list; failed removal retained content, followed by successful list recovery.
- Collection sync failure → retry → success with retained username.
- Picker options failure → retry; recommendation failure → retry → result retaining three-player/60-minute choices. The final two-step flow was rechecked; a double-click issued one request.
- Registration empty-field errors focused Name; show/hide worked; failed submission retained fields; double-click issued one request; explicit retry succeeded.
- Password reset validation, failed submission, duplicate prevention and successful retry with retained input.
- Collection, Discover, Rankings and Insights layouts were inspected across 390, 768, 1024 and 1440px. Mobile navigation fit; dense frames reached a bounded 1040px at 1440px; Picker remained 430px at desktop width. Rankings comparison controls stayed usable after capping artwork.
- Keyboard Tab produced a visible 2px gold outline. Measured mobile Discover buttons/links had no targets below 44×44px and no page horizontal overflow.
- `/rankings` correctly redirected to `/collection/ranking` and rendered the comparison screen.

A read-only review agent checked recovery, state retention, duplicate protection and App integration. Its two findings (stale expiry notice and ambiguous retained sync success) were fixed; the final follow-up reported no new actionable regressions.

## Limits and remaining work

- These browser checks are mocked interaction checks, not production, live-email, real-device or installed-PWA verification. Browser zoom and physical touch-device checks were not completed.
- A timeout cannot establish whether the server committed a write; users are told to check current state before retrying. There is no automatic mutation replay.
- Existing user edits and untracked skill support directories/audit screenshots were preserved. The final working tree is intentionally uncommitted; the entire diff includes those approved concurrent changes as well as UX-1B.
- Next: Foundation B production verification (Render provisioning, real email delivery, backup/restore rehearsal and production smoke tests). No Home dashboard, desktop sidebar, Discover pagination or broad design-system rewrite was added by this slice.
