import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from api.main import app
from auth.security import create_access_token, hash_password
from database.connection import Base, get_db
from database.models import Game, User, UserWishlistGame


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(autouse=True)
def database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def seed_user(email):
    db = TestingSessionLocal()
    user = User(
        email=email,
        display_name=email,
        password_hash=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    user_id = user.id
    db.close()
    return user_id, {
        "Authorization": f"Bearer {token}"
    }


def seed_game(bgg_id, name):
    db = TestingSessionLocal()
    db.add(
        Game(
            bgg_id=bgg_id,
            name=name,
            min_players=2,
            max_players=4,
            max_play_time=60,
            complexity=2.5,
            owned=False,
        )
    )
    db.commit()
    db.close()


def test_add_and_duplicate_add_are_safe(client):
    user_id, headers = seed_user("one@example.com")
    seed_game(1, "First")

    first = client.post("/wishlist/1", headers=headers)
    duplicate = client.post("/wishlist/1", headers=headers)

    assert first.status_code == 200
    assert duplicate.status_code == 200
    assert first.json()["owned"] is False

    db = TestingSessionLocal()
    assert (
        db.query(UserWishlistGame)
        .filter(UserWishlistGame.user_id == user_id)
        .count()
        == 1
    )
    db.close()


def test_seven_adds_preserve_every_wishlist_game(client):
    user_id, headers = seed_user("seven@example.com")

    for bgg_id in range(1, 8):
        seed_game(bgg_id, f"Game {bgg_id}")

        response = client.post(
            f"/wishlist/{bgg_id}",
            headers=headers,
        )

        assert response.status_code == 200
        assert response.json()["owned"] is False

    listed = client.get("/wishlist", headers=headers)

    assert listed.status_code == 200
    assert {
        game["bgg_id"]
        for game in listed.json()
    } == set(range(1, 8))

    db = TestingSessionLocal()
    assert (
        db.query(UserWishlistGame)
        .filter(UserWishlistGame.user_id == user_id)
        .count()
        == 7
    )
    db.close()


def test_remove_from_wishlist(client):
    _, headers = seed_user("one@example.com")
    seed_game(1, "First")
    client.post("/wishlist/1", headers=headers)

    removed = client.delete("/wishlist/1", headers=headers)
    listed = client.get("/wishlist", headers=headers)

    assert removed.status_code == 200
    assert listed.json() == []


def test_wishlist_is_scoped_to_current_user(client):
    _, first_headers = seed_user("one@example.com")
    _, second_headers = seed_user("two@example.com")
    seed_game(1, "First")
    seed_game(2, "Second")

    client.post("/wishlist/1", headers=first_headers)
    client.post("/wishlist/2", headers=second_headers)

    first = client.get("/wishlist", headers=first_headers)
    second = client.get("/wishlist", headers=second_headers)

    assert [game["bgg_id"] for game in first.json()] == [1]
    assert [game["bgg_id"] for game in second.json()] == [2]
