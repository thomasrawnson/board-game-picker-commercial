from fastapi import FastAPI
from fastapi.middleware.cors import (
    CORSMiddleware,
)
from config import settings
from api.dependencies import (
    get_collection_service,
    get_game_service,
    get_play_repository,
    get_play_service,
)

from api.routers import (
    auth,
    collection,
    games,
    health,
    imports,
    insights,
    picker,
    plays,
)

from logging_config import (
    configure_logging,
)

# Backwards-compatible name used by the
# existing API tests.
get_picker_play_repository = (
    get_play_repository
)

configure_logging()

app = FastAPI(
    title="BoardGamePicker API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        settings.cors_origins
    ),
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)

app.include_router(
    health.router
)

app.include_router(
    games.router
)

app.include_router(
    collection.router
)

app.include_router(
    picker.router
)

app.include_router(
    plays.router
)

app.include_router(
    insights.router
)

app.include_router(
    imports.router
)

app.include_router(
    auth.router
)
