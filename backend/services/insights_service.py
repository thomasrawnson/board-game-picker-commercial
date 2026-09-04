from models.collection_insights import (
    CollectionInsights,
)
from repositories.insights_repository import (
    InsightsRepository,
)


class InsightsService:
    def __init__(
        self,
        repository: InsightsRepository,
    ):
        self.repository = repository

    def get_collection_insights(
        self,
    ) -> CollectionInsights:
        total_games = (
            self.repository
            .total_owned_games()
        )

        played_games_count = (
            self.repository
            .played_games_count()
        )

        if total_games:
            collection_played_percentage = round(
                (
                    played_games_count
                    / total_games
                )
                * 100
            )
        else:
            collection_played_percentage = 0

        return CollectionInsights(
            total_games=total_games,
            total_plays=(
                self.repository.total_plays()
            ),
            played_games_count=(
                played_games_count
            ),
            collection_played_percentage=(
                collection_played_percentage
            ),
            total_duration_minutes=(
                self.repository
                .total_duration_minutes()
            ),
            average_duration_minutes=(
                self.repository
                .average_duration_minutes()
            ),
            most_played=(
                self.repository
                .get_most_played()
            ),
            last_played=(
                self.repository
                .get_last_played()
            ),
            never_played_count=(
                self.repository
                .never_played_count()
            ),
            frequent_players=(
                self.repository
                .get_frequent_players()
            ),
        )