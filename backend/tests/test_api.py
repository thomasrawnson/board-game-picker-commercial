from datetime import datetime, timezone

from fastapi.testclient import TestClient

from api.main import (
    app,
    get_collection_service,
    get_game_service,
    get_picker_play_repository,
    get_play_service,
)
from models.game import Game
from models.play import Play


client = TestClient(app)

client = TestClient(app)

def test_get_game_returns_game():
    class FakeGameService:
        def get_game(self, bgg_id: int):
            return Game(
                bgg_id=bgg_id,
                name="Gloomhaven",
                year_published=2017,
                min_players=1,
                max_players=4,
                complexity=3.86,
                rating=8.5,
            )

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.get("/games/174430")

        assert response.status_code == 200

        data = response.json()

        assert data["bgg_id"] == 174430
        assert data["name"] == "Gloomhaven"
        assert data["min_players"] == 1
        assert data["max_players"] == 4

    finally:
        app.dependency_overrides.clear()


def test_get_missing_game_returns_404():
    class FakeGameService:
        def get_game(self, bgg_id: int):
            return None

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.get("/games/999999")

        assert response.status_code == 404
        assert response.json() == {
            "detail": "Game not found"
        }

    finally:
        app.dependency_overrides.clear()


def test_create_game():
    class FakeGameService:
        def create_game(self, game):
            return game

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.post(
            "/games",
            json={
                "bgg_id": 999999,
                "name": "Test Game",
                "year_published": 2026,
                "min_players": 2,
                "max_players": 4,
                "rating": 8.0,
                "complexity": 2.5,
            },
        )

        assert response.status_code == 201

        data = response.json()

        assert data["bgg_id"] == 999999
        assert data["name"] == "Test Game"
        assert data["min_players"] == 2
        assert data["max_players"] == 4

    finally:
        app.dependency_overrides.clear()


def test_create_game_rejects_invalid_rating():
    class FakeGameService:
        def create_game(self, game):
            return game

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.post(
            "/games",
            json={
                "bgg_id": 999999,
                "name": "Test Game",
                "rating": 15,
            },
        )

        assert response.status_code == 422

    finally:
        app.dependency_overrides.clear()

def test_get_games():
    class FakeGameService:
        def get_games(self):
            return [
                Game(bgg_id=174430, name="Gloomhaven"),
                Game(bgg_id=167791, name="Terraforming Mars"),
            ]

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.get("/games")

        assert response.status_code == 200

        data = response.json()

        assert len(data) == 2
        assert data[0]["name"] == "Gloomhaven"
        assert data[1]["name"] == "Terraforming Mars"

    finally:
        app.dependency_overrides.clear()

def test_update_game():
    class FakeGameService:
        def update_game(self, game):
            return game

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.put(
            "/games/174430",
            json={
                "bgg_id": 174430,
                "name": "Gloomhaven Updated",
                "rating": 9.0,
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert data["bgg_id"] == 174430
        assert data["name"] == "Gloomhaven Updated"
        assert data["rating"] == 9.0

    finally:
        app.dependency_overrides.clear()

def test_delete_game():
    class FakeGameService:
        def delete_game(self, bgg_id):
            return True

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.delete("/games/174430")

        assert response.status_code == 200
        assert response.json() == {
            "message": "Game deleted"
        }

    finally:
        app.dependency_overrides.clear()

def test_update_missing_game_returns_404():
    class FakeGameService:
        def update_game(self, game):
            return None

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.put(
            "/games/999999",
            json={
                "bgg_id": 999999,
                "name": "Missing Game",
            },
        )

        assert response.status_code == 404

    finally:
        app.dependency_overrides.clear()

def test_delete_missing_game_returns_404():
    class FakeGameService:
        def delete_game(self, bgg_id):
            return False

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    try:
        client = TestClient(app)

        response = client.delete("/games/999999")

        assert response.status_code == 404

    finally:
        app.dependency_overrides.clear()

def test_sync_collection():
    class FakeCollectionService:
        def sync_collection(self, username):
            return [
                Game(bgg_id=174430, name="Gloomhaven"),
                Game(bgg_id=167791, name="Terraforming Mars"),
            ]

    app.dependency_overrides[get_collection_service] = (
        lambda: FakeCollectionService()
    )

    try:
        response = client.post("/collections/tom/sync")

        assert response.status_code == 200
        assert response.json() == {
            "username": "tom",
            "games_synced": 2,
        }

    finally:
        app.dependency_overrides.clear()

def test_picker_returns_ranked_matches():
    class FakeGameService:
        def get_games(self):
            return [
                Game(
                    bgg_id=1,
                    name="Short Game",
                    min_players=2,
                    max_players=4,
                    max_play_time=30,
                    complexity=2.0,
                    owned=True,
                ),
                Game(
                    bgg_id=2,
                    name="Best Match",
                    min_players=2,
                    max_players=4,
                    max_play_time=55,
                    complexity=2.8,
                    owned=True,
                ),
                Game(
                    bgg_id=3,
                    name="Too Long",
                    min_players=2,
                    max_players=4,
                    max_play_time=180,
                    complexity=2.5,
                    owned=True,
                ),
            ]

    class FakePlayRepository:
        def get_game_play_stats(self):
            return {}

    app.dependency_overrides[
        get_game_service
    ] = lambda: FakeGameService()

    app.dependency_overrides[
        get_picker_play_repository
    ] = lambda: FakePlayRepository()

    try:
        response = client.get(
            "/picker",
            params={
                "players": 2,
                "max_play_time": 60,
                "max_complexity": 3.0,
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["game"]["bgg_id"] == 2
    assert (
        data[0]["game"]["name"]
        == "Best Match"
    )
    assert (
        data[0]["score"]
        > data[1]["score"]
    )
    assert (
        "Supports 2 players"
        in data[0]["reasons"]
    )


def test_picker_requires_valid_player_count():
    class FakeGameService:
        def get_games(self):
            return []

    class FakePlayRepository:
        def get_game_play_stats(self):
            return {}

    app.dependency_overrides[
        get_game_service
    ] = lambda: FakeGameService()

    app.dependency_overrides[
        get_picker_play_repository
    ] = lambda: FakePlayRepository()

    try:
        response = client.get(
            "/picker",
            params={
                "players": 0,
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422

def test_record_play_returns_404_for_unknown_game():
    class FakePlayService:
        def record_play(
            self,
            bgg_id: int,
            played_at,
            duration_minutes: int | None,
            participants: list[dict],
        ):
            return None

    app.dependency_overrides[get_play_service] = (
        lambda: FakePlayService()
    )

    try:
        response = client.post(
            "/plays",
            json={
                "bgg_id": 999999999,
                "played_at": (
                    "2026-08-28T20:00:00+00:00"
                ),
                "duration_minutes": 60,
                "participants": [
                    {
                        "name": "Tom",
                        "score": 10,
                        "is_winner": True,
                    },
                ],
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Game not found"
    )
    
def test_picker_uses_preferred_mechanic():
    class FakeGameService:
        def get_games(self):
            return [
                Game(
                    bgg_id=1,
                    name="Deck Builder",
                    min_players=2,
                    max_players=4,
                    max_play_time=60,
                    complexity=2.5,
                    owned=True,
                    mechanics=["Deck Building"],
                ),
                Game(
                    bgg_id=2,
                    name="Worker Placement Game",
                    min_players=2,
                    max_players=4,
                    max_play_time=60,
                    complexity=2.5,
                    owned=True,
                    mechanics=["Worker Placement"],
                ),
            ]

    class FakePlayRepository:
        def get_game_play_stats(self):
            return {}

    app.dependency_overrides[get_game_service] = (
        lambda: FakeGameService()
    )

    app.dependency_overrides[
        get_picker_play_repository
    ] = lambda: FakePlayRepository()

    try:
        response = client.get(
            "/picker",
            params={
                "players": 2,
                "max_play_time": 60,
                "max_complexity": 3.0,
                "preferred_mechanics": "Deck Building",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["game"]["bgg_id"] == 1

    assert (
        "Matches preferred mechanic: Deck Building"
        in data[0]["reasons"]
    )