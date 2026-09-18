---
name: shelfpick-release-check
description: Run ShelfPick's complete local release validation across backend, database schema, frontend and PWA, and report readiness. Use for release readiness or a requested full validation, not every small edit.
---

# ShelfPick release check

This skill validates the current checkout; it does not implement fixes, commit,
push, deploy, invoke hosting/provider CLIs or mutate external resources.
Tests may write to a verified local/disposable test database and builds may
produce local generated files.

## Preparation

1. Locate the repository root. Read applicable root instructions, if present,
   plus `backend/AGENTS.md` and `frontend/AGENTS.md` because this workflow spans both.
2. Record `git status --short` and `git diff --stat` before validation.
3. Use the existing local backend virtual environment and installed frontend
   dependencies. Do not create environments or install dependencies unless
   already authorized. Virtual environments must not be committed to Git.
4. Resolve an absolute Python executable path from the repository root:
   `backend/.venv/Scripts/python.exe` on Windows or
   `backend/.venv/bin/python` on macOS/Linux. Verify it starts before use.
5. Inspect test database configuration without printing credentials. Confirm
   pytest targets a development/test database and Alembic targets the intended
   development schema. If either target cannot be established safely, mark
   that check blocked and continue the independent checks.

## Execute

Run each check independently and retain its exit status. A failed check must
not prevent other independent checks from running. Do not launch concurrent
database checks. Use the resolved absolute Python path as `<python>` below.

| Working directory | Command |
| --- | --- |
| backend | `<python> -m pytest` |
| backend | `<python> -m alembic check` |
| frontend | `npm test` |
| frontend | `npm run lint` |
| frontend | `npm run build` |
| frontend | `npm run check:pwa` |
| repository root | `git diff --check` |

If build fails, do not accept PWA checks against stale output as validation of
the current checkout; report that dependency as blocked even if a command exits
successfully. Do not apply migrations to make `alembic check` pass: report a
behind-head database or schema drift for a separate repair task.

If a launcher references a missing interpreter, capture the exact failure.
An equivalent entry point from the same existing environment is allowed only
if it installs or alters nothing. Report the original failure, fallback command
and whether the fallback completed the same check. Do not silently switch to
global Python or treat a partial fallback as a full pass.

Finish with `git status --short` and `git diff --stat` from the repository root.
Compare with the baseline; never attribute pre-existing changes to validation
or discard changes to tidy the report.

## Report

- Overall PASS only when every required check completed successfully for this
  checkout. Use FAIL for failed checks and INCOMPLETE when checks are blocked
  or unrun; if both occur, report FAIL with incomplete coverage.
- Give each actual command, working directory, exit result and brief outcome.
- Separate warnings from failures; follow the repository's configured gates.
- Explain likely causes from evidence: assertion failure, schema drift,
  database revision mismatch, lint/type errors, missing dependencies, broken
  environment, missing PWA assets or whitespace errors.
- List blocked/unrun checks and any fallback limitations explicitly.
- Report unexpected tracked changes or relevant generated artifacts relative
  to the baseline. A successful automated check does not imply live-account,
  production, browser or real-device verification.
