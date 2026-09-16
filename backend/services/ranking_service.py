from repositories.ranking_repository import (
    RankingRepository,
)


class RankingService:
    def __init__(
        self,
        repository: RankingRepository,
    ):
        self.repository = repository

    def get_matchup(
        self,
        exclude_bgg_ids: list[int] | None = None,
        played_only: bool = True,
    ) -> list[dict]:
        return self.repository.get_matchup(
            exclude_bgg_ids,
            played_only,
        )

    def get_rankings(
        self,
        played_only: bool = True,
        summary_limit: int = 20,
    ) -> dict:
        return self.repository.get_rankings(
            played_only,
            summary_limit,
        )

    def choose(
        self,
        winner_bgg_id: int,
        loser_bgg_id: int,
    ) -> dict:
        if winner_bgg_id == loser_bgg_id:
            raise ValueError(
                "Choose between two different games."
            )

        result = (
            self.repository.record_comparison(
                winner_bgg_id,
                loser_bgg_id,
            )
        )

        if result is None:
            raise ValueError(
                "Both games must be eligible owned games."
            )

        return result

    def mark_unplayed(
        self,
        bgg_id: int,
    ) -> bool:
        return self.repository.set_unplayed(
            bgg_id,
            True,
        )

    def restore_game(
        self,
        bgg_id: int,
    ) -> bool:
        return self.repository.set_unplayed(
            bgg_id,
            False,
        )
