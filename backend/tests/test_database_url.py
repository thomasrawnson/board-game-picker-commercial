import importlib.util

import pytest
from alembic.config import Config
from sqlalchemy import engine_from_config

from database.url import create_database_engine
from database.url import database_url_for_alembic
from database.url import normalize_database_url


DRIVERLESS_URL = (
    "postgresql://user%40example.com:p%40ss%2Fword"
    "@db.example.com:5432/shelfpick"
    "?sslmode=require&application_name=Shelf%20Pick"
)
PSYCOPG_URL = (
    "postgresql+psycopg://user%40example.com:p%40ss%2Fword"
    "@db.example.com:5432/shelfpick"
    "?sslmode=require&application_name=Shelf%20Pick"
)


@pytest.mark.parametrize(
    ("database_url", "expected"),
    [
        (DRIVERLESS_URL, PSYCOPG_URL),
        (PSYCOPG_URL, PSYCOPG_URL),
        (
            "postgresql+pg8000://user:password@db/app",
            "postgresql+pg8000://user:password@db/app",
        ),
        (
            "sqlite:///./shelfpick.db",
            "sqlite:///./shelfpick.db",
        ),
    ],
)
def test_database_url_normalisation(
    database_url: str,
    expected: str,
):
    assert normalize_database_url(database_url) == expected


@pytest.mark.parametrize(
    "database_url",
    [
        DRIVERLESS_URL,
        PSYCOPG_URL,
    ],
)
def test_application_engine_uses_installed_psycopg_driver(
    database_url: str,
):
    engine = create_database_engine(database_url)

    try:
        assert engine.url.drivername == "postgresql+psycopg"
        assert engine.dialect.driver == "psycopg"
        assert engine.dialect.dbapi.__name__ == "psycopg"
        assert importlib.util.find_spec("psycopg") is not None
    finally:
        engine.dispose()


@pytest.mark.parametrize(
    "database_url",
    [
        DRIVERLESS_URL,
        PSYCOPG_URL,
    ],
)
def test_alembic_engine_uses_installed_psycopg_driver(
    database_url: str,
):
    config = Config()
    config.set_main_option(
        "sqlalchemy.url",
        database_url_for_alembic(database_url),
    )

    assert config.get_main_option(
        "sqlalchemy.url"
    ) == PSYCOPG_URL

    engine = engine_from_config(
        config.get_section(
            config.config_ini_section,
        ),
        prefix="sqlalchemy.",
    )

    try:
        assert engine.url.drivername == "postgresql+psycopg"
        assert engine.dialect.driver == "psycopg"
        assert engine.dialect.dbapi.__name__ == "psycopg"
    finally:
        engine.dispose()
