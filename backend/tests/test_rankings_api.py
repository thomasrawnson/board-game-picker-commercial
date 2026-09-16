from fastapi.testclient import TestClient

from api.dependencies import get_ranking_service
from api.main import app


client = TestClient(app)


class FakeRankingService:
    def __init__(self):
        self.choices = []
        self.unplayed = []
        self.restored = []
        self.matchup_filters = []
        self.ranking_filters = []
        self.summary_limits = []

    def get_matchup(
        self,
        exclude_bgg_ids,
        played_only,
    ):
        self.matchup_filters.append(played_only)
        return [
            {"bgg_id": 1, "name": "First"},
            {"bgg_id": 2, "name": "Second"},
        ]

    def get_rankings(
        self,
        played_only,
        summary_limit,
    ):
        self.ranking_filters.append(played_only)
        self.summary_limits.append(summary_limit)
        return {
            "rankings": [],
            "unplayed": [],
            "summary": {
                "games_count": 0,
                "designers": [],
                "publishers": [],
                "mechanics": [],
                "categories": [],
            },
        }

    def choose(self, winner_bgg_id, loser_bgg_id):
        self.choices.append(
            (winner_bgg_id, loser_bgg_id)
        )
        return {
            "winner": {"bgg_id": winner_bgg_id},
            "loser": {"bgg_id": loser_bgg_id},
        }

    def mark_unplayed(self, bgg_id):
        self.unplayed.append(bgg_id)
        return True

    def restore_game(self, bgg_id):
        self.restored.append(bgg_id)
        return True


def test_ranking_matchup_and_comparison():
    service = FakeRankingService()
    app.dependency_overrides[
        get_ranking_service
    ] = lambda: service

    try:
        matchup_response = client.get(
            "/rankings/matchup?played_only=false"
        )
        rankings_response = client.get(
            "/rankings?played_only=false&summary_limit=50"
        )
        choice_response = client.post(
            "/rankings/comparisons",
            json={
                "winner_bgg_id": 1,
                "loser_bgg_id": 2,
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert matchup_response.status_code == 200
    assert len(
        matchup_response.json()["games"]
    ) == 2
    assert choice_response.status_code == 201
    assert service.choices == [(1, 2)]
    assert rankings_response.status_code == 200
    assert service.matchup_filters == [False]
    assert service.ranking_filters == [False]
    assert service.summary_limits == [50]


def test_ranking_summary_limit_is_validated():
    service = FakeRankingService()
    app.dependency_overrides[
        get_ranking_service
    ] = lambda: service

    try:
        response = client.get(
            "/rankings?summary_limit=25"
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


def test_unplayed_game_can_be_restored():
    service = FakeRankingService()
    app.dependency_overrides[
        get_ranking_service
    ] = lambda: service

    try:
        exclude_response = client.post(
            "/rankings/games/42/unplayed"
        )
        restore_response = client.delete(
            "/rankings/games/42/unplayed"
        )
    finally:
        app.dependency_overrides.clear()

    assert exclude_response.status_code == 204
    assert restore_response.status_code == 204
    assert service.unplayed == [42]
    assert service.restored == [42]
