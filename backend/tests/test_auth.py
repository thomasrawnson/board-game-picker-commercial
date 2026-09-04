from datetime import (
    datetime,
    timedelta,
    timezone,
)

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import (
    sessionmaker,
)
from sqlalchemy.pool import StaticPool

from api.main import app
from auth.security import (
    JWT_ALGORITHM,
    JWT_ISSUER,
    JWT_SECRET,
    create_access_token,
)
from database.connection import (
    Base,
    get_db,
)
from database.models import (
    Game,
    User,
    UserGame,
)


engine = create_engine(
    "sqlite://",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(autouse=True)
def test_database():
    Base.metadata.create_all(
        bind=engine
    )

    yield

    Base.metadata.drop_all(
        bind=engine
    )


@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()

        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[
        get_db
    ] = override_get_db

    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def register_user(
    client: TestClient,
    email: str = "tom@example.com",
    display_name: str = "Tom",
    password: str = "password123",
):
    return client.post(
        "/auth/register",
        json={
            "email": email,
            "display_name": display_name,
            "password": password,
        },
    )


def test_register_returns_token_and_user(
    client: TestClient,
):
    response = register_user(client)

    assert response.status_code == 201

    data = response.json()

    assert data["access_token"]
    assert data["token_type"] == "bearer"

    assert (
        data["user"]["email"]
        == "tom@example.com"
    )

    assert (
        data["user"]["display_name"]
        == "Tom"
    )


def test_duplicate_registration_returns_409(
    client: TestClient,
):
    first = register_user(client)

    assert first.status_code == 201

    second = register_user(client)

    assert second.status_code == 409


def test_login_returns_token(
    client: TestClient,
):
    register_user(client)

    response = client.post(
        "/auth/login",
        json={
            "email": "tom@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert (
        data["user"]["email"]
        == "tom@example.com"
    )


def test_login_rejects_wrong_password(
    client: TestClient,
):
    register_user(client)

    response = client.post(
        "/auth/login",
        json={
            "email": "tom@example.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401


def test_me_returns_authenticated_user(
    client: TestClient,
):
    register_response = (
        register_user(client)
    )

    token = register_response.json()[
        "access_token"
    ]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization":
                f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    assert response.json()["email"] == (
        "tom@example.com"
    )


def test_me_requires_token(
    client: TestClient,
):
    response = client.get(
        "/auth/me"
    )

    assert response.status_code == 401


def test_me_rejects_invalid_token(
    client: TestClient,
):
    response = client.get(
        "/auth/me",
        headers={
            "Authorization":
                "Bearer definitely-not-valid",
        },
    )

    assert response.status_code == 401


def test_me_rejects_expired_token(
    client: TestClient,
):
    now = datetime.now(
        timezone.utc
    )

    token = jwt.encode(
        {
            "sub": "1",
            "iat": now
            - timedelta(hours=2),
            "exp": now
            - timedelta(hours=1),
            "iss": JWT_ISSUER,
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    response = client.get(
        "/auth/me",
        headers={
            "Authorization":
                f"Bearer {token}",
        },
    )

    assert response.status_code == 401


def test_protected_endpoint_requires_auth(
    client: TestClient,
):
    response = client.get(
        "/games"
    )

    assert response.status_code == 401


def test_users_only_see_their_own_collection(
    client: TestClient,
):
    first = register_user(
        client,
        email="tom@example.com",
        display_name="Tom",
    )

    second = register_user(
        client,
        email="other@example.com",
        display_name="Other",
    )

    first_token = first.json()[
        "access_token"
    ]

    second_token = second.json()[
        "access_token"
    ]

    db = TestingSessionLocal()

    try:
        first_user = (
            db.query(User)
            .filter(
                User.email
                == "tom@example.com"
            )
            .one()
        )

        second_user = (
            db.query(User)
            .filter(
                User.email
                == "other@example.com"
            )
            .one()
        )

        first_game = Game(
            bgg_id=1001,
            name="Tom's Game",
            owned=False,
        )

        second_game = Game(
            bgg_id=1002,
            name="Other Game",
            owned=False,
        )

        db.add_all(
            [
                first_game,
                second_game,
            ]
        )

        db.flush()

        db.add_all(
            [
                UserGame(
                    user_id=first_user.id,
                    game_id=first_game.id,
                ),
                UserGame(
                    user_id=second_user.id,
                    game_id=second_game.id,
                ),
            ]
        )

        db.commit()

    finally:
        db.close()

    first_response = client.get(
        "/games",
        headers={
            "Authorization":
                f"Bearer {first_token}",
        },
    )

    second_response = client.get(
        "/games",
        headers={
            "Authorization":
                f"Bearer {second_token}",
        },
    )

    assert (
        first_response.status_code
        == 200
    )

    assert (
        second_response.status_code
        == 200
    )

    first_ids = {
        game["bgg_id"]
        for game
        in first_response.json()
    }

    second_ids = {
        game["bgg_id"]
        for game
        in second_response.json()
    }

    assert first_ids == {1001}
    assert second_ids == {1002}