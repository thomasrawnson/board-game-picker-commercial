# Board Game Picker

Board Game Picker is a mobile-first application for answering a familiar game-night question: **what should we play?**

The application imports a board game collection, stores game and play-history data in PostgreSQL, and recommends suitable games based on player count, available play time, complexity and recent play history.

The longer-term product direction expands the picker into a broader board-game collection, session-tracking and analytics application, while keeping the picker and collection experience at its core.

It is also being developed as a data-engineering portfolio project, with an emphasis on ingestion, transformation, relational modelling, API design, testing and explainable recommendation logic.

## Current progress

Board Game Picker now has a working end-to-end application flow covering collection ingestion, recommendation, play tracking and collection analytics.

Currently implemented:

- React + TypeScript mobile-first frontend
- installable PWA support
- Python/FastAPI backend
- PostgreSQL 16 local development environment using Docker Compose
- SQLAlchemy persistence layer
- Alembic database migrations
- layered API, service and repository architecture
- user accounts with registration, login and JWT-based authentication
- Argon2 password hashing (pwdlib) and PyJWT-signed access tokens
- per-user data isolation across collection, plays and insights
- BoardGameGeek XML API client and parsers
- retry handling for queued BoardGameGeek API responses
- BG Stats JSON collection ingestion
- BG Stats historical play ingestion
- idempotent play import using source identifiers
- one-tap "send to BG Stats" integration for plays logged in the app
- game metadata including player counts, play time, complexity, ratings and artwork
- category and mechanic persistence via relational join tables
- deterministic and explainable recommendation engine
- player-count and play-time filtering
- recommendation scoring informed by historical play recency
- game reveal interface using real BoardGameGeek artwork
- play-history recording from the frontend, including participants, scores and winners
- reusable player identities with normalised-name matching, so the same person is recognised across plays regardless of case or whitespace
- player-name autocomplete when logging a play
- collection resynchronisation that reconciles additions and removals against the current BoardGameGeek collection
- collection-insights API and React dashboard
- PostgreSQL aggregate queries for most played, last played and never played games
- automated tests across parsers, repositories, services and API endpoints

Development currently uses a BG Stats export as the primary source for collection and historical play data. BoardGameGeek integration is also available for collection and metadata synchronisation.

## Product direction

The picker remains the main entry point, but the application is intended to grow around four connected areas:

### Pick

- filter the collection by player count, available time and complexity
- rank suitable games using explainable scoring
- use play history to surface games that have been neglected
- improve the reveal experience and make recommendation text clearer over game artwork
- show useful session context such as the last played date and last winner

### Collection

- browse and manage the owned collection
- import games from BG Stats
- import and synchronise games from BoardGameGeek, including removing games that are no longer owned on a resync
- add games manually
- category and mechanic metadata is persisted; designers and publishers are not yet retained

### Play

- record game sessions with participants, scores and winners rather than only aggregate player counts
- reusable player identities: a normalised-name match means "Alex" and "alex" resolve to the same player rather than fragmenting stats
- player-name autocomplete when logging a session, sourced from previously used players
- send a logged play directly to BG Stats via a one-tap integration
- import participant-level historical data from BG Stats where available
- retain session date, duration and other useful play metadata
- surface player-level analytics (win rate, head-to-head, most-played-together) from the identities already captured

The relational model has evolved to:

```text
games
players
plays
play_participants
```

`play_participants` associates a `player` with an individual `play` and is the natural home for participant-specific values such as score and winner status. `players` are scoped per user and matched by a normalised name, so the same person is recognised across sessions without needing an account of their own. This structure supports player-level analytics without overloading the `plays` table, and the two Alembic migrations that introduced it also backfilled existing play history so no participant data was lost.

### Insights

The analytics area is intended to support time-based, game-based, collection-based and player-based views, including examples such as:

- most played games
- most played games by month, year and all time
- total plays by month and year
- most successful games for a selected player
- player win counts and win rates
- head-to-head player statistics
- last winner for a game
- games not played recently
- collection utilisation
- most represented designers
- most represented publishers
- category and mechanic distributions

Ranked views will support top-N questions such as top 10 most played games or the games a selected player has won most often.

## Architecture

```text
React / TypeScript PWA
          |
          v
       FastAPI
          |
          v
  Application services
      /        \
     v          v
BGG / BG Stats  Repositories
                    |
                    v
                PostgreSQL
```

The backend uses a layered architecture so external clients, application logic and persistence remain separated.

```text
API
 |
Service
 |
Repository / External client
 |
PostgreSQL / BoardGameGeek / BG Stats
```

This keeps business logic independent of transport and persistence details and allows individual layers to be tested in isolation.

## Data ingestion

The application supports both BoardGameGeek XML and BG Stats JSON data flows.

```text
BoardGameGeek XML API ----> BGG parser --------\
                                               > Domain Game model
BG Stats JSON export ------> Collection parser /
                                                      |
                                                      v
                                                Import service
                                                      |
                                                      v
                                                  Repository
                                                      |
                                                      v
                                                 PostgreSQL
```

Historical play data is imported separately from the same BG Stats export:

```text
BG Stats plays
      |
      v
Resolve gameRefId to BGG ID
      |
      v
Parse play date, players and duration
      |
      v
Deduplicate by source + play UUID
      |
      v
PostgreSQL plays table
```

The collection importer filters the export to currently owned games and uses the BGG ID as the stable game identifier. Re-importing collection data updates existing records instead of creating duplicates.

Historical plays are also idempotent: imported play UUIDs are stored with their source so repeated imports do not duplicate play records.

Data also flows in the other direction for plays logged directly in the app: a one-tap link builds a BG Stats-compatible payload client-side and hands it to the BG Stats app, so a session recorded here doesn't have to be re-entered there.

A future import screen is intended to provide explicit choices for **BG Stats**, **BoardGameGeek**, and **manual game entry** rather than tying collection management to a single source.

## Recommendation engine

The recommendation engine is deterministic and explainable rather than AI-driven.

Games are first filtered for eligibility using criteria such as:

- player count
- maximum play time
- maximum complexity
- ownership status

Eligible games are then ranked using a weighted score. Current scoring considers suitability against the selected criteria and historical play recency, allowing games that have not been played recently to rank above otherwise similar choices.

The API returns both the score and human-readable reasons so the frontend can explain why a game was recommended.

Example reasons include:

- `Supports 3 players`
- `Fits within 60 minutes`
- `Complexity 2.8 fits preference`
- `Hasn't been played in a while`

Play-history scoring will continue to be refined as the project develops.

## Collection insights

The application includes collection analytics backed by PostgreSQL aggregate queries.

Current insights include:

- total owned games
- total recorded plays
- most played games
- last played game
- games that have never been played

Historical BG Stats plays feed the same database used by the picker, so analytics and recommendations operate from a shared source of truth.

The reusable player identities introduced for play recording provide the foundation the analytics layer needs to expand into winner, score, player, monthly, yearly, designer and publisher statistics; the insights queries themselves are not yet updated to group by that identity.

## Technology stack

### Backend

- **Python 3.12** — application, ingestion and transformation logic
- **FastAPI** — REST API and dependency injection
- **Pydantic** — request validation
- **SQLAlchemy** — ORM, sessions and database access
- **psycopg** — PostgreSQL driver
- **httpx** — BoardGameGeek HTTP client
- **pwdlib (Argon2)** — password hashing
- **PyJWT** — signed access tokens
- **pytest** — unit and integration testing

### Database and infrastructure

- **PostgreSQL 16** — relational application database
- **Alembic** — version-controlled schema migrations
- **Docker / Docker Compose** — reproducible local database environment

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **vite-plugin-pwa** — installable mobile web application support

### Planned / next

- player-based insights (win rate, head-to-head, most-played-together) built on the existing player identities
- expanded play and collection analytics
- designer and publisher persistence
- multi-source import UI and manual game entry
- personal ranking and preference signals
- similar-game discovery
- GitHub Actions CI/CD
- Azure deployment
- production configuration and observability
- AI-assisted natural-language game filtering

## Testing

Testing is developed alongside each milestone rather than added at the end of the project.

The test suite covers areas including:

- BoardGameGeek HTTP client behaviour
- XML parsing
- BG Stats JSON parsing
- historical play parsing
- collection processing
- PostgreSQL connectivity
- repository CRUD operations
- service-layer behaviour
- recommendation scoring
- collection insights
- FastAPI endpoints

External dependencies are replaced with fakes, mocks or dependency overrides where appropriate so individual application layers can be tested independently.

Run the backend tests from `backend`:

```bash
python -m pytest
```

Check that SQLAlchemy models and Alembic migrations remain aligned:

```bash
alembic check
```

From `frontend`, run the routing tests, lint, production build and generated
PWA asset check:

```bash
npm test
npm run lint
npm run build
npm run check:pwa
```

GitHub Actions runs these frontend checks and the complete backend suite on
every push and pull request. Its PostgreSQL 16 service starts empty, so the CI
backend job also proves that the full Alembic migration history upgrades a
clean database and remains aligned with the SQLAlchemy models.

## Local development

### Prerequisites

- Python 3.12+
- Node.js
- Docker Desktop / Docker Compose

### Database

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

Apply database migrations from `backend`:

```bash
alembic upgrade head
```

The backend uses a `DATABASE_URL` environment variable. Local secrets and personal collection exports are intentionally excluded from source control.

### Backend

From `backend` with the virtual environment activated:

```bash
uvicorn api.main:app --reload
```

FastAPI's interactive API documentation is available at `/docs` on the local API server.

For local testing from another device on the same network, the API can be exposed on the local network:

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

From `frontend`:

```bash
npm install
npm run dev
```

For local mobile testing:

```bash
npm run dev -- --host
```

The frontend API URL can be configured using the `VITE_API_BASE_URL` environment variable.

Build the frontend with:

```bash
npm run build
```

The authenticated frontend uses client-side routes. A production static
host must rewrite unknown, non-asset navigation requests to `/index.html`
with a successful response so direct links and refreshes work. The PWA
service worker also uses `/index.html` as its navigation fallback, but it
does not replace the host rewrite for a visitor's first request.

## Roadmap

Development is organised so new product features also strengthen the underlying engineering and data model.

1. **Recommendation refinement** — complete and validate play-history-aware scoring against real historical data.
2. ~~Players and game sessions~~ — done: `players` and `play_participants` are implemented with Alembic migrations, a backfill migration for existing data, and repository/service coverage.
3. ~~Rich play recording~~ — done: the application records participants, winners and scores, with reusable player identities and autocomplete.
4. ~~Historical participant ingestion~~ — done: BG Stats play import populates player/session detail idempotently, resolving each participant to a persistent player record.
5. **Play analytics** — add monthly, yearly and all-time views plus player wins, win rates, game rankings and head-to-head statistics, building on the player identities already captured.
6. **Rich collection metadata** — persist designers and publishers using appropriate relational models (categories and mechanics are already persisted).
7. **Collection analytics** — add top designers/publishers, collection distributions, utilisation and related ranked views.
8. **Import and collection management UX** — provide BG Stats import, BoardGameGeek sync and manual game-entry options in the frontend.
9. **Picker and mobile UX polish** — strengthen reveal-card readability, surface last winner/history and improve mobile component structure.
10. **Personalisation and discovery** — add personal rankings, preference signals and similar-game discovery.
11. **Engineering and deployment** — add GitHub Actions CI/CD, production configuration, observability and Azure deployment.
12. **Release exploration** — evaluate packaging/distribution for iOS and Android and validate the product with real users.
13. **Optional advanced features** — explore AI-assisted natural-language filtering once the deterministic recommendation and data foundations are mature.

## Potential product model

The immediate priority is building a useful product rather than implementing billing. If the application develops into a public release, one possible model is to keep the core picker and collection experience free while evaluating advanced analytics and personalisation as optional premium functionality.

Potential free functionality could include collection management, importing, the basic picker, game reveals and basic play recording. Potential premium functionality could include deeper player analytics, win/loss history, head-to-head statistics, advanced trends, richer collection analytics and advanced recommendation preferences.

This is a product direction rather than a committed pricing model; monetisation will only be considered after the core experience is useful and validated.

## Project goals

The project is intended to demonstrate practical experience with:

- external API and file-based data ingestion
- XML and JSON parsing
- transformation into consistent domain models
- idempotent data loading
- source identifier mapping and deduplication
- relational data modelling
- PostgreSQL and SQL aggregation
- schema migration management
- Python application architecture
- REST API design
- automated testing
- Docker-based development
- explainable recommendation logic
- React and TypeScript frontend integration
- analytical data modelling for game, session and player-level reporting
- CI/CD and cloud deployment as later milestones

## Status

**Active development**

The core application is functional end to end: user accounts, collection ingestion, PostgreSQL persistence, recommendation, rich play tracking with reusable player identities, and collection insights are all implemented, alongside a two-way integration with BG Stats for both importing and sending play data.

Current development is focused on recommendation refinement and building player-level analytics (win rate, head-to-head, most-played-together) on top of the player identities now captured, before expanding collection metadata to include designers and publishers. The longer-term direction is a release-capable board-game collection, picker, play-tracking and analytics application.
