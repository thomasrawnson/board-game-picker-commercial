from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from api.current_user import (
    get_current_user,
)
from auth.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from database.connection import get_db
from database.models import User


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


def user_response(
    user: User,
) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        bgg_username=user.bgg_username,
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = (
        request.email
        .strip()
        .lower()
    )

    existing = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists"
            ),
        )

    user = User(
        email=email,
        display_name=(
            request.display_name.strip()
        ),
        password_hash=hash_password(
            request.password
        ),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        user.id
    )

    return AuthResponse(
        access_token=token,
        user=user_response(user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    email = (
        request.email
        .strip()
        .lower()
    )

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if (
        user is None
        or user.password_hash
        is None
        or not verify_password(
            request.password,
            user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    token = create_access_token(
        user.id
    )

    return AuthResponse(
        access_token=token,
        user=user_response(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return user_response(
        current_user
    )