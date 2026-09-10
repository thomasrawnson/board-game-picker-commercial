from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database.connection import engine


router = APIRouter(
    tags=["health"],
)


@router.get("/health")
def health():
    database_ok = False

    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

        database_ok = True
    except SQLAlchemyError:
        database_ok = False

    return {
        "status": (
            "ok"
            if database_ok
            else "degraded"
        ),
        "database": (
            "ok"
            if database_ok
            else "unavailable"
        ),
    }