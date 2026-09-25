# UI-2B — Collection visual polish

Completed 25 September 2026.

## Presentation changes

- Owned rows use larger, contained artwork, 18px display titles and a quiet
  year/player-count/play-time metadata line.
- Positive play counts remain visible as restrained Gold status chips. The
  repeated “Not played” label was removed because absent ShelfPick history is
  not proof that a game has never been played.
- Want to Play uses the same title scale, wrapping behavior and resilient
  artwork fallback as Owned.
- Owned and Want to Play details share resilient artwork, a bounded heading
  group and balanced long-title wrapping. Existing conversion, removal and
  play-log actions are unchanged.
- The existing mobile list and bounded two-column desktop list remain in place;
  UI-3 still owns any new desktop shell or card/grid architecture.

## Finding disposition

The pre-beta/Kimi findings for undersized Collection artwork and noisy repeated
“Not played” metadata were still present and are resolved in this slice. The
UI-1 artwork fallback was already present in Owned list/detail views, so it was
verified and reused rather than replaced; the remaining Want to Play list and
detail inconsistencies were brought onto that shared component.

## Validation

All checks used deterministic authenticated fixtures intercepted in Playwright;
no live account or database data was read or changed.

- `npm run lint`: passed.
- `npm test`: 31 passed. Vite emitted non-fatal sandbox WebSocket `EPERM`
  diagnostics during source-transform tests; the test process passed.
- `npm run build`: passed.
- `npm run check:colors`: passed.
- `npm run check:pwa`: passed.
- Playwright: passed at 390×844, 768×900, 1024×900 and 1440×900 in light and
  dark themes for both Owned and Want to Play.
- State coverage: populated, empty, filtered-empty, loading and error; long
  titles; missing and failed artwork; visible keyboard focus; reachable detail
  and conversion actions; and no horizontal overflow.
- Navigation coverage: both Owned and Want to Play list → detail → browser Back
  restored their prior scroll positions. Switching between the two sections
  also preserved both offsets independently.

## Screenshots

- [Owned reconstructed baseline](screenshots/ui-2b/owned-1440-light-reconstructed-before.png)
- [Owned after](screenshots/ui-2b/owned-1440-light-after.png)
- [Want to Play reconstructed baseline](screenshots/ui-2b/want-to-play-1440-light-reconstructed-before.png)
- [Want to Play after](screenshots/ui-2b/want-to-play-1440-light-after.png)

The two baseline images are reconstructions made from the pre-UI-2B CSS and
copy over the same deterministic fixture data. They are useful presentation
references, not pixel-exact captures of the earlier revision, and are not
claimed as an exact before/after comparison.

## Remaining limitations

- Validation was mocked rather than a live-backend/account pass.
- Artwork metadata refresh and the UI-3 desktop restructuring remain outside
  UI-2B.
