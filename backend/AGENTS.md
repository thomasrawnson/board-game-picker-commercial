# ShelfPick backend

Applies to `backend/`. Read frontend instructions too when changing that side.
Keep changing roadmap priorities outside this file.

## Implementation

- FastAPI routers handle HTTP, services implement business rules, and repositories own persistence queries. Preserve these boundaries.
- Inspect the current code and preserve unrelated working-tree changes. Keep work within the requested slice; avoid incidental refactors and dependencies.
- Scope personal data to the authenticated user; never trust a client-supplied user ID for authorization.
- Wishlist membership and collection ownership are separate. Saving a wishlist item must not mark it owned.
- Preserve historical plays when ownership changes and keep imports idempotent.
- Exclude expansions from Collection and Picker candidates, including legacy records that require metadata refresh.
- Keep Picker eligibility deterministic. Exact-count poll evidence with at least 10 votes excludes games at 30% or more Not Recommended. Missing or low-sample evidence must not be described as strong community approval.
- Keep explanations consistent with scoring and retain deterministic fallback when optional AI is unavailable. Do not enable production AI as an incidental change.
- Validate API inputs and preserve existing response contracts unless the task explicitly requires a coordinated change.
- Use Alembic for schema changes. Consider existing rows, defaults, backfills and migration compatibility.
- Bound external calls and handle upstream failure without losing local data. Never log passwords, tokens, connection strings or secrets.

## Development checks

- Use the existing local Python environment; `.venv` is not a version-controlled dependency. Inspect test configuration before database-dependent checks; use only a development/test database.
- Run focused regression tests for changed behaviour. Expand to the full backend suite for cross-cutting changes or an explicit release check.
- From `backend/`, use `.venv/Scripts/python.exe -m pytest` on Windows or `.venv/bin/python -m pytest` on macOS/Linux. Pass test paths for focused runs.
- For schema changes, validate migrations against a disposable database and run `python -m alembic check` using that environment. Do not apply migrations to production as part of validation.
- For complete release validation, use `.agents/skills/shelfpick-release-check/SKILL.md` from the repository root rather than duplicating its checklist here.

## Completion

Update affected API/setup documentation. Report behaviour changes, checks performed and material limitations. Do not commit, push, deploy or change external resources unless requested. Preserve unrelated work.
