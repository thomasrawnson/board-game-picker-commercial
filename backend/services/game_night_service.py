from models.game import Game
from models.game_play_stats import GamePlayStats
from services.picker_service import (
    PickerCriteria,
    PickerMatch,
    PickerService,
)


class GameNightService:
    def __init__(self, picker_service: PickerService | None = None):
        self.picker_service = picker_service or PickerService()

    def recommend(
        self,
        games: list[Game],
        player_ids: list[int],
        max_play_time: int | None,
        play_stats: dict[int, GamePlayStats] | None = None,
        group_play_stats: dict[int, GamePlayStats] | None = None,
        limit: int = 5,
    ) -> list[PickerMatch]:
        matches = self.picker_service.rank_matches(
            games,
            PickerCriteria(
                players=len(player_ids),
                player_ids=player_ids,
                max_play_time=max_play_time,
            ),
            play_stats=play_stats,
            group_play_stats=group_play_stats,
        )

        return matches[:limit]
