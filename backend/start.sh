#!/usr/bin/env bash

set -e

alembic upgrade head

exec uvicorn api.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}"