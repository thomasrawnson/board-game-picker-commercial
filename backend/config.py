import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(
    __file__
).resolve().parent

load_dotenv(
    BACKEND_DIR / ".env"
)


def _get_bool(
    name: str,
    default: bool = False,
) -> bool:
    value = os.getenv(
        name
    )

    if value is None:
        return default

    return (
        value.strip().lower()
        in {
            "1",
            "true",
            "yes",
            "on",
        }
    )


@dataclass(frozen=True)
class Settings:
    environment: str
    database_url: str
    jwt_secret: str
    access_token_minutes: int
    cors_origins: list[str]
    ai_picker_enabled: bool


def get_settings() -> Settings:
    environment = os.getenv(
        "APP_ENV",
        "development",
    ).strip().lower()

    database_url = os.getenv(
        "DATABASE_URL",
        "",
    ).strip()

    jwt_secret = os.getenv(
        "JWT_SECRET",
        "",
    ).strip()

    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            (
                "http://localhost:5173,"
                "http://127.0.0.1:5173"
            ),
        ).split(",")
        if origin.strip()
    ]

    access_token_minutes = int(
        os.getenv(
            "ACCESS_TOKEN_MINUTES",
            "1440",
        )
    )

    ai_picker_enabled = _get_bool(
        "AI_PICKER_ENABLED",
        False,
    )

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL must be configured"
        )

    if not jwt_secret:
        raise RuntimeError(
            "JWT_SECRET must be configured"
        )

    if (
        environment == "production"
        and any(
            origin.startswith(
                "http://localhost"
            )
            or origin.startswith(
                "http://127.0.0.1"
            )
            for origin
            in cors_origins
        )
    ):
        raise RuntimeError(
            "Production CORS_ORIGINS "
            "must not contain localhost"
        )

    if (
        environment == "production"
        and ai_picker_enabled
    ):
        raise RuntimeError(
            "AI picker must remain disabled "
            "for the first production release"
        )

    return Settings(
        environment=environment,
        database_url=database_url,
        jwt_secret=jwt_secret,
        access_token_minutes=(
            access_token_minutes
        ),
        cors_origins=cors_origins,
        ai_picker_enabled=(
            ai_picker_enabled
        ),
    )


settings = get_settings()