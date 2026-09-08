from datetime import datetime, timezone

from models.collection_insights import (
    GamePlaySummary,
    LastPlayedGame,
    PlayerSummary,
)
from services.insights_service import (
    InsightsService,
)


class FakeInsightsRepository:
    def total_owned_games(self):
        return 194

    def total_plays(self):
        return 12

    def played_games_count(self):
        return 44

    def total_duration_minutes(self):
        return 720

    def average_duration_minutes(self):
        return 60

    def get_most_played(self):
        return GamePlaySummary(
            bgg_id=167791,
            name="Terraforming Mars",
            play_count=4,
        )

    def get_last_played(self):
        return LastPlayedGame(
            bgg_id=167791,
            name="Terraforming Mars",
            played_at=datetime.now(
                timezone.utc
            ),
        )

    def never_played_count(self):
        return 150

    def get_frequent_players(self):
        return [
            PlayerSummary(
                id=1,
                name="Tom",
                play_count=10,
                win_count=4,
            ),
            PlayerSummary(
                id=2,
                name="Wales",
                play_count=8,
                win_count=3,
            ),
        ]
    
    def get_monthly_activity(self):
        from models.collection_insights import (
            MonthlyActivity,
        )

        return MonthlyActivity(
            plays=12,
            unique_games=7,
            new_games=3,
            repeat_plays=9,
            recent_plays=[],
        )


    def get_neglected_games(self):
        return []


    def get_top_games_by_player(self):
        return []


    def get_common_groups(self):
        return []


def test_get_collection_insights():
    service = InsightsService(
        FakeInsightsRepository()
    )

    insights = (
        service.get_collection_insights()
    )

    assert (
        insights.frequent_players[0].id
        == 1
    )
    assert insights.total_games == 194
    assert insights.total_plays == 12

    assert (
        insights.played_games_count
        == 44
    )

    assert (
        insights.collection_played_percentage
        == 23
    )

    assert (
        insights.total_duration_minutes
        == 720
    )

    assert (
        insights.average_duration_minutes
        == 60
    )

    assert insights.most_played is not None

    assert (
        insights.most_played.name
        == "Terraforming Mars"
    )

    assert (
        insights.most_played.play_count
        == 4
    )

    assert insights.last_played is not None

    assert (
        insights.last_played.name
        == "Terraforming Mars"
    )

    assert (
        insights.never_played_count
        == 150
    )

    assert (
        len(insights.frequent_players)
        == 2
    )

    assert (
        insights.frequent_players[0].name
        == "Tom"
    )

    assert (
        insights.frequent_players[0].win_count
        == 4
    )