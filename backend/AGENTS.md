# Board Game Picker — Commercial

## Project

This repository contains the commercial Board Game Picker application.
It is separate from the portfolio repository. Verify this repository’s
actual configuration rather than assuming they share features or CI.

Stack:

- Frontend: React, TypeScript, Vite, PWA.
- Backend: Python, FastAPI, SQLAlchemy.
- Database: PostgreSQL with Alembic migrations.
- Integrations: BoardGameGeek and BG Stats.

## Working approach

- Inspect relevant code before editing.
- Follow existing components, API contracts and architecture.
- Keep each task focused on the requested slice.
- Preserve unrelated changes in the working tree.
- Avoid broad refactoring, new dependencies or schema changes unless
  needed to complete the task.
- Make reasonable implementation decisions and proceed.
- Ask only when a material ambiguity cannot be resolved from the code
  or the task instructions.
- Report limitations honestly; never claim an unperformed check passed.

## Product and data rules

- Wishlist membership and collection ownership are separate.
- Saving to Want to Play must never mark a game as owned.
- Scope personal data and operations to the authenticated user.
- Never trust a client-supplied user ID for authorization.
- Preserve idempotent collection and play imports.
- Preserve historical plays when collection ownership changes.
- Keep recommendation eligibility deterministic and explanations
  consistent with the actual scoring.
- Preserve deterministic fallback when optional AI is unavailable.
- Keep AI disabled for production unless explicitly requested.

## Backend

- Keep HTTP handling in routers, business logic in services and
  persistence queries in repositories.
- Validate inputs at API boundaries.
- Use Alembic migrations for schema changes.
- Consider existing data and backfills when changing models.
- Preserve API compatibility unless the task requires a coordinated change.
- Handle external-service failures with bounded timeouts and useful errors.
- Never log passwords, access tokens, reset tokens or secrets.

## Frontend

- Preserve the existing green, cream and gold visual style.
- Reuse existing components and styles.
- Support mobile, tablet and desktop layouts.
- Keep main navigation accessible while scrolling.
- Respect safe-area insets and prevent navigation from obscuring content.
- Provide readable contrast, keyboard focus and accessible control labels.
- Handle loading, empty, error and retry states where relevant.
- Roll back optimistic updates when requests fail.
- Preserve existing navigation and game-detail entry points.

## Validation

Run checks appropriate to the change. trigger deploy

Frontend, from frontend/:

- npm run lint
- npm run build

Backend, from backend/ with dependencies and test configuration ready:

- python -m pytest

For schema changes, against a disposable development/test database:

- alembic upgrade head
- alembic check

Additional guidance:

- Inspect database test setup before running database-dependent tests.
- Never run tests or migrations against production data.
- Add focused tests for meaningful behavior changes and regressions.
- Use existing browser/test tooling for UI interaction checks.
- Do not introduce a large test framework for a small styling change.
- Distinguish pre-existing failures from regressions.
- State which checks were not run and why.

## Documentation

- Update documentation when behavior, setup or API contracts change.
- Keep README descriptions consistent with implemented functionality.
- Keep changing priorities and slice plans outside this file.

## Git and completion

- Do not commit or push unless the user requests it.
- Do not reset, discard or overwrite unrelated user changes.
- Leave completed changes ready for review.

When finished, report:

1. What changed and why.
2. Files changed.
3. Validation results and any checks not run.
4. Remaining issues or limitations.
5. A suggested commit message.
