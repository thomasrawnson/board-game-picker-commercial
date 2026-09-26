# Free versus Pro presentation validation

Validated 26 September 2026 as a bounded presentation-only slice.

## Delivered

- Reframed the comparison around a useful Free product and concrete outcomes.
- Limited current Pro benefits to the implemented personalised `For You`
  entitlement and removed planned candidates from the current comparison.
- Added distinct Free and Pro account presentations without changing the tier
  or entitlement checks.
- Aligned locked Discover and defensive Game Night states on “Compare Free and
  Pro” and linked both directly to `/settings/pro`.
- Recorded the agreed £3.99 launch price as a one-off purchase, not a
  subscription. The Pro action remains disabled because no price is configured
  and checkout is not implemented.

## Validation

- `npm test`: passed, including the one-recorded-play Insights regression.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run check:colors`: passed.
- `npm run check:pwa`: passed.
- Mocked Playwright fixtures covered Free and Pro comparison views at 390, 768,
  1024 and 1440px in light and dark themes. Checks included long copy,
  keyboard focus, reachable actions and no horizontal overflow.
- Mocked locked Discover and defensive locked Game Night entry points both
  reached the comparison route. Discover browser Back returned to Discover.
- The comparison screenshots use the same isolated Free fixture at 1440px in
  light mode before and after the presentation change.

No live account, purchase, external service or database verification was used.
No user data was modified.

## Remaining issues

- The agreed launch price is £3.99 as a one-off purchase, not a subscription.
  No price is technically configured and checkout is not implemented; this
  slice does not change pricing configuration or billing behaviour.
- The broader Settings completion and payment implementation remain separate
  roadmap work.
