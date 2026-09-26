# Truthful For You personalisation states

Completed and validated 26 September 2026.

## Delivered

- Added backward-compatible response headers that identify whether For You
  actually used collection matches, recorded history or saved preferences.
- Preserved the existing recommendation array, calculations, ordering,
  eligibility, source selection and Pro entitlement boundary.
- Labelled personalised results with only the signal families that influenced
  filtering or scoring.
- Labelled source-only results as popular fallback, explained their BGG Hot and
  ranked basis, and linked to the existing Profile preferences screen.
- Kept personalised, fallback, genuine empty, total source failure, local
  dismissals and Free locking as separate states.
- Confirmed that Hot-only results remain personalised when supported user
  signals apply after ranked-source failure.

## Validation

- Backend: 72 service, source, API, entitlement, profile, Game Night, Picker
  and Insights tests
  passed, including empty/no-signal fallback, matching collection signals, one
  play, explicit preference overrides, Hot-only partial-source fallback,
  genuine empty response, total source failure and Free rejection.
- Frontend: 33 tests, lint, production build, colour guard and PWA asset check
  passed. Vite emitted non-fatal WebSocket `EPERM` warnings during component
  tests in the restricted test environment.
- Mocked Playwright: 42 checks covered personalised, popular fallback, empty,
  source error and locked states at 390, 768, 1024 and 1440px in light and dark
  themes, plus dismissed states on mobile in both themes. Checks included the
  Profile action, Pro comparison action, Browse Hot recovery, keyboard focus,
  long-copy wrapping and horizontal overflow.
- Before and after captures use the same isolated Pro fixture at 1440×1200 in
  light mode.

No live account, purchase or live BoardGameGeek request was used. The three
database-backed play repository tests passed against the existing local
PostgreSQL development service on port 5433. The service was started without
resetting data or running migrations.

## Remaining issues

- Hot/ranked candidate caches remain process-local and metadata remains an
  external dependency.
- Pro entitlement responses still include planned capability names without
  corresponding shipped behaviour.
- The agreed £3.99 one-off price is not configured, checkout is not implemented
  and purchasing remains disabled.
