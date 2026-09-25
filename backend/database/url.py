from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


POSTGRESQL_URL_PREFIX = "postgresql://"
PSYCOPG_URL_PREFIX = "postgresql+psycopg://"


def normalize_database_url(database_url: str) -> str:
    """Select Psycopg 3 for driverless PostgreSQL URLs."""
    if database_url.startswith(
        POSTGRESQL_URL_PREFIX
    ):
        return (
            PSYCOPG_URL_PREFIX
            + database_url[
                len(POSTGRESQL_URL_PREFIX):
            ]
        )

    return database_url


def create_database_engine(
    database_url: str,
    **kwargs,
) -> Engine:
    return create_engine(
        normalize_database_url(database_url),
        **kwargs,
    )


def database_url_for_alembic(
    database_url: str,
) -> str:
    # Alembic stores this through ConfigParser, where percent signs
    # are interpolation markers. Doubling them preserves URL escapes.
    return normalize_database_url(
        database_url
    ).replace("%", "%%")
