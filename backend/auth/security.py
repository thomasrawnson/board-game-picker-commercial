import os
from datetime import (
    datetime,
    timedelta,
    timezone,
)
from pathlib import Path

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash


BACKEND_DIR = Path(__file__).resolve().parents[1]

load_dotenv(
    BACKEND_DIR / ".env"
)


JWT_SECRET = os.getenv(
    "JWT_SECRET"
)

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET environment variable "
        "must be configured"
    )


JWT_ALGORITHM = "HS256"
JWT_ISSUER = "boardgamepicker"

ACCESS_TOKEN_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_MINUTES",
        "1440",
    )
)

password_hash = PasswordHash.recommended()


def hash_password(
    password: str,
) -> str:
    return password_hash.hash(
        password
    )


def verify_password(
    password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        password,
        hashed_password,
    )


def create_access_token(
    user_id: int,
) -> str:
    now = datetime.now(
        timezone.utc
    )

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(
            minutes=ACCESS_TOKEN_MINUTES
        ),
        "iss": JWT_ISSUER,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> int:
    payload = jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[
            JWT_ALGORITHM
        ],
        issuer=JWT_ISSUER,
    )

    subject = payload.get(
        "sub"
    )

    if subject is None:
        raise ValueError(
            "Token has no subject"
        )

    return int(subject)