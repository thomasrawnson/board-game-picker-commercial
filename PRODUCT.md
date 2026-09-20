# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

ShelfPick is for board-game hobbyists with growing personal collections who want
a faster, better way to decide what to play, either solo or with friends. The
first commercial audience is expected to be small closed-alpha groups of active
board-game players before broader public release.

## Product Purpose

ShelfPick reduces the decision friction before game night. It imports and
organises a user's collection and play history, then recommends a suitable game
for the people present, the time available and the kind of session they want.

Commercial product quality, user experience, retention and monetisation take
priority when they conflict with its secondary role as a technically strong
portfolio project. Success means users can reach a trusted recommendation
quickly, understand why it fits, record what happened and return for future
decisions.

## Positioning

ShelfPick makes deterministic, explainable recommendations primarily from games
the user already owns. It combines group size, available time, complexity,
player preferences and play history rather than offering a generic catalogue or
an opaque suggestion. The intended mechanism expands to group-specific history
and games owned by any attendee without abandoning explainability.

## Operating Context

- A user imports or synchronises an owned collection from BoardGameGeek and can
  import historical plays from BG Stats.
- Before playing, the user chooses the group, time and preferences; Pick
  filters and ranks eligible games and explains the result.
- Users can browse their collection, save discovery candidates to Want to Play,
  rank favourites, log sessions and inspect collection, play, player and group
  insights.
- The product is an installable mobile-first PWA backed by an authenticated web
  API and PostgreSQL. It is also usable at tablet and desktop widths.
- BoardGameGeek and BG Stats are established parts of the user's collection and
  play-tracking workflow, but upstream failures must not lose local data.

## Capabilities and Constraints

- Current capabilities include accounts, collection ingestion and management,
  deterministic recommendations, Discover, Want to Play, play logging, personal
  rankings and collection/player/group insights.
- Recommendations must remain deterministic and their explanations must match
  the filters and scoring that produced them. Optional AI may assist only when a
  deterministic fallback remains available.
- Owned games, wishlist games and historical plays have distinct meanings.
  Ownership changes must not erase historical plays, and imports must remain
  idempotent.
- Expansions are excluded from Collection and Pick candidates. Player-count
  suitability uses BoardGameGeek community evidence with bounded, documented
  treatment for weak or missing samples.
- User accounts and stored collections, plays, players, wishlists, rankings and
  insights are isolated per user.
- Future Game Night functionality should combine group-specific history with
  games owned by any attendee and support a shared shortlist and group decision.
- Monitoring, feedback capture, privacy information, account deletion and
  production operational safeguards remain required before a wider alpha or
  public launch.
- The final pricing and packaging model is undecided. A free core with paid
  advanced analytics or personalisation is a documented possibility, not a
  committed commercial claim.

## Brand Commitments

- The product name is **ShelfPick**.
- The approved identity uses the Shelf + Meeple mark and the maintained assets
  under `frontend/public/branding/`.
- Product language should be concise, practical and trustworthy. Controls name
  the action; recommendations and failures explain their reasoning and recovery.
- Game artwork and the user's collection remain the primary content. Branding
  supports recognition without competing with that content.

## Evidence on Hand

- `README.md` documents the implemented workflows, architecture, recommendation
  rules, roadmap and deliberately uncommitted monetisation options.
- `frontend/src/` and `backend/` contain the working React/TypeScript PWA,
  FastAPI application, recommendation engine and user-facing product copy.
- `docs/production-runbook.md` records deployment, email, smoke-test and recovery
  requirements; release notes under `docs/` record prior validation limits.
- `docs/design-system.md` and `frontend/public/branding/` contain the current
  design-system and approved brand assets.
- Automated frontend and backend tests cover core routes, authentication,
  ingestion, recommendation, discovery, wishlist, play and insights behaviour.
- No testimonials, public customer counts, commercial benchmarks or validated
  pricing evidence are currently available; future product work must not invent
  them.

## Product Principles

1. Shorten the path from opening ShelfPick to a confident game-night decision.
2. Earn trust through deterministic results and explanations that reflect the
   actual recommendation logic.
3. Start from games people already own, then expand through their real groups,
   history and shared collections.
4. Use observed behaviour and alpha feedback to guide retention and
   personalisation rather than adding speculative complexity.
5. Treat reliability, privacy and recoverability as commercial product features.

## Accessibility & Inclusion

Core journeys must remain keyboard operable, readable in light and dark themes,
and usable on mobile, tablet and desktop. Interactive controls require clear
accessible names, visible focus, semantic error and status feedback, readable
contrast and touch targets suitable for mobile use. Recommendations must not
depend on colour alone to communicate their meaning.
