# Pre-beta design priorities

The agreed pre-beta priorities are:

1. UI/layout redesign;
2. logo/brand correction;
3. Free versus Pro proposition.

These are separate workstreams. UI work does not change the approved logo or
the Free/Pro proposition.

## UI/layout sequence

### UI-1 — confirmed defects

- BoardGameGeek artwork failures can show broken-image UI rather than a
  deliberate ShelfPick fallback.
- Fixed bottom navigation can overlap reachable content.
- Inactive controls can be too weak in dark mode.
- Collection artwork is undersized and repeated “Not played” metadata is noisy.
- Some Insights, Rankings and Discover sparse/empty-state copy is misleading.
- Legacy colour and `!important` overrides contribute to visual drift.

UI-1 is split into bounded implementation slices. UI-1A covers artwork
resilience and Collection readability. UI-1B covers bottom-navigation clearance
and dark inactive-control contrast. UI-1C covers sparse/empty-state copy and
targeted legacy override cleanup.

### UI-2 — core visual polish

After UI-1 is stable, refine hierarchy, typography, spacing, component
consistency, responsive behaviour and the balance between artwork and controls.
Use existing tokens and shared primitives rather than adding screen-specific
visual exceptions.

### UI-3 — full-width, content-forward desktop

Move data-rich desktop surfaces beyond the current narrow app-shell treatment
into a full-width, content-forward layout where game artwork has greater visual
weight. The future desktop card/grid treatment belongs here, not in UI-1.

## Visual principle and guardrails

The visual principle is **“warm shelf, confident choices.”** Warm neutrals
provide structure. Forest mainly indicates action and selection. Gold is
restrained emphasis. Game artwork should carry more visual weight.

Game Night remains in primary navigation as a distinct host-led flow and must
not be merged with Picker. Across UI-1, UI-2 and UI-3:

- preserve all recommendation rules;
- preserve exact-player-count suitability logic;
- preserve the BoardGameGeek Not Recommended >=30% exclusion rule;
- preserve routes, deep links and browser Back behaviour;
- preserve collection state and scroll restoration;
- do not change backend/domain behaviour unless strictly required for artwork
  fallback handling;
- do not change the logo or Free/Pro proposition as part of UI work;
- do not deploy, migrate production data or change secrets as part of these
  implementation slices.
