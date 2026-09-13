from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
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
from auth.login_rate_limiter import (
    LOGIN_WINDOW_SECONDS,
    login_rate_limiter,
)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

def login_rate_limit_key(
    request: Request,
    email: str,
) -> str:
    forwarded_for = (
        request.headers.get(
            "x-forwarded-for"
        )
    )

    if forwarded_for:
        client_ip = (
            forwarded_for
            .split(",")[0]
            .strip()
        )
    elif request.client:
        client_ip = (
            request.client.host
        )
    else:
        client_ip = "unknown"

    return (
        f"{client_ip}:"
        f"{email}"
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
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    email = (
        credentials.email
        .strip()
        .lower()
    )

    rate_limit_key = (
        login_rate_limit_key(
            request,
            email,
        )
    )

    if (
        login_rate_limiter
        .is_limited(
            rate_limit_key
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_429_TOO_MANY_REQUESTS
            ),
            detail=(
                "Too many failed login "
                "attempts. Please try "
                "again later."
            ),
            headers={
                "Retry-After": str(
                    LOGIN_WINDOW_SECONDS
                ),
            },
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
            credentials.password,
            user.password_hash,
        )
    ):
        login_rate_limiter.record_failure(
            rate_limit_key
        )

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Invalid email or password"
            ),
        )

    login_rate_limiter.reset(
        rate_limit_key
    )

    token = create_access_token(
        user.id
    )

    return AuthResponse(
        access_token=token,
        user=user_response(user),
    )

@router.post(
    "/onboarding/complete",
    response_model=UserResponse,
)
def complete_onboarding(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    if (
        current_user.bgg_username
        is None
    ):
        current_user.bgg_username = ""

        db.commit()
        db.refresh(
            current_user
        )

    return user_response(
        current_user
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