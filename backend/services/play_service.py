from models.play import Play
from repositories.play_repository import (
    PlayRepository,
)


class PlayService:
    def __init__(
        self,
        repository: PlayRepository,
    ):
        self.repository = repository

    def record_play(
        self,
        bgg_id: int,
        played_at,
        duration_minutes: int | None,
        participants: list[dict],
    ) -> Play | None:
        return self.repository.create(
            bgg_id=bgg_id,
            played_at=played_at,
            duration_minutes=duration_minutes,
            participants=participants,
        )