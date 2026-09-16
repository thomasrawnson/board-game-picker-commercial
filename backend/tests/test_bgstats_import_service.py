from pathlib import Path

from models.game import Game
from models.game import PlayerCountPoll
from services.bgstats_import_service import BGStatsImportService


FIXTURE = (
    Path(__file__).parent
    / "fixtures"
    / "bgstats_collection.json"
)


def test_import_only_owned_games():
    class FakeRepository:
        def __init__(self):
            self.created = []

        def get_by_bgg_id(self, bgg_id):
            return None

        def create(self, game):
            self.created.append(game)
            return game

    repository = FakeRepository()
    service = BGStatsImportService(repository)

    json_text = FIXTURE.read_text(encoding="utf-8")

    games = service.import_owned_games(json_text)

    assert len(games) == 1
    assert games[0].name == "Terraforming Mars"

    assert len(repository.created) == 1
    assert repository.created[0].bgg_id == 167791


def test_import_updates_existing_game():
    poll = PlayerCountPoll(
        player_count=2,
        best_votes=0,
        recommended_votes=9,
        not_recommended_votes=40,
        total_votes=49,
    )

    class FakeRepository:
        def __init__(self):
            self.updated = []

        def get_by_bgg_id(self, bgg_id):
            if bgg_id == 167791:
                return Game(
                    bgg_id=bgg_id,
                    name="Existing game",
                    best_player_counts=[4],
                    recommended_player_counts=[3, 4],
                    player_count_poll=[poll],
                )

            return None

        def create(self, game):
            return game

        def update(self, game):
            self.updated.append(game)
            return game

    repository = FakeRepository()
    service = BGStatsImportService(repository)

    json_text = FIXTURE.read_text(encoding="utf-8")

    games = service.import_owned_games(json_text)

    assert len(games) == 1
    assert len(repository.updated) == 1
    assert repository.updated[0].bgg_id == 167791
    assert repository.updated[0].best_player_counts == [4]
    assert repository.updated[0].recommended_player_counts == [
        3,
        4,
    ]
    assert repository.updated[0].player_count_poll == [poll]
