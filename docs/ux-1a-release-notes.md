# Release UX-1A implementation report

## Findings before editing

- Initial git status contained only the user's untracked `.agents/`, `audit-login-1440.png` and `audit-login-390.png`. These were preserved. No overlapping changes were present.
- The repository guidance was read, and the existing release-check skill informed validation. No new skill or dependencies were introduced.
- Source and rendered login inspection confirmed legacy branding in authentication, loading, browser/PWA metadata and sharing/export copy.
- Navigation used Pick, Shelf, Group and Insight, with a late mobile override reducing labels to 9px. Settings used a meeple.
- Many supporting labels and controls used 9-13px type. Discover save was 34px; settings, sharing, sorting and contextual actions had compact overrides below 44px.
- The existing cascade includes repeated refinement rules. This slice changes those rules and introduces only four text-size tokens and one target-size token; it does not replace the stylesheet architecture.

## Result

- ShelfPick branding covers frontend authentication/onboarding/loading, document metadata, manifest name/short name, favicon accessible title, exported/share text, authentication emails and API documentation title.
- Primary destinations are Picker, Collection, Game Night, Discover and Insights. Want to Play and Insights entry/back labels are consistent. Routes and navigation structure are unchanged.
- Settings uses a gear with its existing accurate accessible name and title.
- Body default is 16px; supporting copy/controls are at least 14px, metadata at least 12px, and nonessential overlines 11px. Auth fields use 16px.
- Interactive floors are 44px. Existing smaller overrides were corrected, visible icons remain small, focus indicators are retained, and navigation clearance is 122px plus the safe-area inset.
- No new routes, dashboard, sidebar, skeletons, pagination, shared GameCard, backend logic, database/migration changes, commits, pushes or deployments.

## Files changed and purpose

| Files | Purpose |
| --- | --- |
| `frontend/index.html`, `frontend/vite.config.ts`, `frontend/public/favicon.svg` | ShelfPick browser/PWA/accessibility metadata; description and application name. |
| `frontend/README.md` | Consistent frontend product name. |
| `frontend/src/App.tsx` | Gear icon and loading branding. |
| `frontend/src/components/AppNavigation.tsx` | Clear destination labels. |
| `frontend/src/components/AuthView.tsx`, `ForgotPasswordView.tsx`, `ResetPasswordView.tsx`, `VerifyEmailView.tsx`, `OnboardingView.tsx` | ShelfPick authentication/onboarding branding. |
| `frontend/src/components/CollectionView.tsx`, `WishlistView.tsx`, `collection/WishlistGameDetail.tsx`, `DiscoverView.tsx` | Consistent Want to Play destination, action and accessible labels; internal wishlist identifiers retained. |
| `frontend/src/components/InsightsView.tsx`, `RankGamesView.tsx` | Insights heading/section/back labels and ShelfPick sharing text. |
| `frontend/src/components/picker/PickerView.tsx`, `frontend/src/utils/bgstats.ts` | Visible error and export-source branding. |
| `frontend/src/styles/tokens.css` | Focused text and target minimum tokens. |
| `frontend/src/styles/base.css` | Body typography, shared target floors, settings target. |
| `frontend/src/styles/navigation.css` | Readable five-item navigation with room for wrapping. |
| `frontend/src/styles/auth.css` | Readable labels, hints and fields; visible input focus. |
| `frontend/src/styles/picker.css` | Picker supporting text, targets, gear styling and share-control clearance. |
| `frontend/src/styles/collection.css` | Collection/detail/history/form text, remove/sort/contextual controls and input focus. |
| `frontend/src/styles/discover.css` | Readable metadata/actions, 44px save control and space beside its target. |
| `frontend/src/styles/insights.css` | Readable insight text and tabs; share target and tab sizing. |
| `frontend/src/styles/rankings.css` | Ranking labels, metadata and action targets. |
| `frontend/src/styles/setup.css`, `onboarding.css`, `game-night.css`, `add-game.css` | Supporting text and applicable input focus. |
| `frontend/src/styles/commercial.css`, `ui.css` | Correct definitive compact overrides, navigation clearance and shared control typography. |
| `backend/api/routers/auth.py` | Email subject/body branding only. |
| `backend/api/main.py` | API documentation display title only. |
| `backend/config.py`, `backend/.env.example` | Default/example sender display name only; addresses and environment keys unchanged. |
| `docs/ux-1a-release-notes.md` | This report. |

## Legacy names

No visible legacy product names are intentionally retained in application display strings. Internal auth storage/event/logger identifiers, repository/package/database names, historical documentation and test fixture strings remain unchanged. An externally configured `EMAIL_FROM` display name can override the new default; deployed configuration was not modified.

## Validation

| Check | Result |
| --- | --- |
| `cd frontend; npm test` | Passed: 3 route tests. |
| `npm run lint` | Passed. |
| `npm run build` | Passed, including generated service worker. |
| `npm run check:pwa` | Passed. Manifest name and short name separately inspected: ShelfPick. Existing dice artwork has no legacy lettering. |
| Backend `.venv/Scripts/python.exe -m pytest tests/test_auth.py tests/test_config.py tests/test_email_service.py` | Passed: 29 tests. Authentication tests use in-memory SQLite. |
| `git diff --check` | Passed. |
| `git status --short` | Reviewed; user files preserved and temporary preview removed. |
| Read-only review agent | Found two remaining target overrides, both fixed. Final frontend pass found no further actionable issues. |

Warnings: Git reports LF-to-CRLF normalization notices for some edited files. Backend tests report an existing Starlette/httpx deprecation warning. Neither is a test failure.

The full backend suite and Alembic alignment check were not run: this slice changes only backend display strings and no models, schema or database behavior. This is UX-1A validation, not a full backend release certification.

## Browser coverage and limits

Browser checks used the real local React frontend with temporary in-memory API fixtures, not live account data. The fixture was deleted after testing and was not part of the production build.

- At 390x844: inspected authentication, Picker steps/result, Collection, Want to Play, Discover, Game Night, Insights and settings. Navigation fits without label clipping/overlap. Discover save updates its accessible pressed state and remove label.
- At 768x1024: inspected Insights and Rankings.
- At 1024x900: inspected Rankings and Picker steps.
- At 1440x900: inspected Picker result and persistent navigation.
- All seven requested routes rendered: Picker, Collection, Discover, Want to Play, Game Night, Rankings and Insights. The checks are representative breakpoint coverage, not an exhaustive matrix of every screen at every width.
- DOM measurements found no sub-44px buttons/summary/link targets on inspected Picker, Discover, Insights, Want to Play, Rankings and authentication states. Read-only cascade review covered remaining compact target overrides.
- Keyboard navigation activated Discover. Tab focus showed a 2px gold outline on the Picker share/Start over controls and authentication fields. Focused Start over cleared the nav by about 58px at 390px.
- No horizontal document overflow was measured at the checked widths. The established narrow desktop presentation remains intentionally in place.

Remaining UX-1A concerns: no known blocker in the inspected states. Live-account content, large datasets, real-device safe-area behavior, screen readers and OS-installed PWA name refresh were not exhaustively tested. Existing sender configuration may require a later display-name update.

## UX-1B proposal

1. Error recovery: consistent inline errors and retry actions for collection, discovery, insights and imports; preserve input, distinguish empty data from failed requests, and retain optimistic rollback.
2. Registration validation: show password requirements before submission, validate email/password fields with accessible inline messages, focus the first invalid field, and preserve safe input after server failures.
3. Minimum tablet/desktop responsiveness: introduce a bounded wider content area and selective two-column layouts for dense screens; verify 768/1024/1440 widths, keyboard focus, zoom and mobile navigation clearance without adding a Home dashboard or full sidebar shell.

Suggested commit message: `Improve ShelfPick branding, navigation and accessible sizing`
