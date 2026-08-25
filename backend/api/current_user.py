import os

from fastapi import (
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User


DEV_USER_EMAIL = os.getenv(
    "DEV_USER_EMAIL",
    "dev@boardgamepicker.local",
)


def get_current_user(
    db: Session = Depends(get_db),
) -> User:
    user = (
        db.query(User)
        .filter(
            User.email == DEV_USER_EMAIL
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=500,
            detail=(
                "Development user has not "
                "been initialised"
            ),
        )

    return user