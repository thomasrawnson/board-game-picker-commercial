from fastapi import (
    APIRouter,
    HTTPException,
    status,
)
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from database.connection import engine


router = APIRouter(
    tags=["health"],
)


@router.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=(
                status
                .HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail={
                "status": "degraded",
                "database": "unavailable",
            },
        ) from exc

    return {
        "status": "ok",
        "database": "ok",
    }