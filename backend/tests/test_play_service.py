from datetime import (
    datetime,
    timezone,
)

from models.play import Play
from services.play_service import (
    PlayService,
)


class FakePlayRepository:
    def __init__(self):
        self.created = None

    def create(
        self,
        bgg_id: int,
        played_at,
        duration_minutes: int | None,
        participants: list[dict],
    ) -> Play:
        self.created = {
            "bgg_id": bgg_id,
            "played_at": played_at,
            "duration_minutes": (
                duration_minutes
            ),
            "participants": participants,
        }

        return Play(
            id=1,
            bgg_id=bgg_id,
            player_count=len(participants),
            played_at=played_at,
        )


def test_record_play_uses_repository():
    repository = FakePlayRepository()
    service = PlayService(repository)

    played_at = datetime(
        2026,
        8,
        28,
        20,
        0,
        tzinfo=timezone.utc,
    )

    participants = [
        {
            "name": "Tom",
            "score": 83,
            "is_winner": True,
        },
        {
            "name": "Sarah",
            "score": 72,
            "is_winner": False,
        },
    ]

    play = service.record_play(
        bgg_id=167791,
        played_at=played_at,
        duration_minutes=75,
        participants=participants,
    )

    assert repository.created == {
        "bgg_id": 167791,
        "played_at": played_at,
        "duration_minutes": 75,
        "participants": participants,
    }

    assert play.bgg_id == 167791
    assert play.player_count == 2