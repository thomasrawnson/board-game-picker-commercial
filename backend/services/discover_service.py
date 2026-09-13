from collections import Counter

from bgg.client import BGGClient
from bgg.game_parser import (
    parse_games_metadata,
)
from bgg.hot_parser import (
    parse_hot_game_ids,
)
from repositories.game_repository import (
    GameRepository,
)


class DiscoverService:
    def __init__(
        self,
        repository: GameRepository,
        bgg_client: BGGClient,
        user_id: int,
    ):
        self.repository = repository
        self.bgg_client = bgg_client
        self.user_id = user_id


    def get_recommendations(
        self,
        limit: int = 10,
    ) -> list[dict]:
        owned_games = (
            self.repository
            .get_owned_by_user(
                self.user_id
            )
        )

        owned_bgg_ids = {
            game.bgg_id
            for game in owned_games
        }

        preferred_categories = Counter(
            category
            for game in owned_games
            for category in (
                game.categories or []
            )
        )

        preferred_mechanics = Counter(
            mechanic
            for game in owned_games
            for mechanic in (
                game.mechanics or []
            )
        )

        hot_xml = (
            self.bgg_client
            .get_hot_games()
        )

        hot_ids = (
            parse_hot_game_ids(
                hot_xml
            )
        )

        candidate_ids = [
            bgg_id
            for bgg_id in hot_ids
            if bgg_id
            not in owned_bgg_ids
        ][:30]

        if not candidate_ids:
            return []

        candidates = []

        for index in range(
            0,
            len(candidate_ids),
            20,
        ):
            batch = candidate_ids[
                index:index + 20
            ]

            metadata_xml = (
                self.bgg_client
                .get_games(
                    batch
                )
            )

            candidates.extend(
                parse_games_metadata(
                    metadata_xml
                )
            )

        recommendations = []

        for game in candidates:
            score = 0.0
            reasons: list[str] = []

            category_matches = [
                category
                for category
                in (game.categories or [])
                if category
                in preferred_categories
            ]

            mechanic_matches = [
                mechanic
                for mechanic
                in (game.mechanics or [])
                if mechanic
                in preferred_mechanics
            ]

            if category_matches:
                score += sum(
                    preferred_categories[
                        category
                    ]
                    for category
                    in category_matches
                )

                top_categories = sorted(
                    category_matches,
                    key=lambda category:
                        preferred_categories[
                            category
                        ],
                    reverse=True,
                )[:2]

                reasons.append(
                    "Matches your interest in "
                    + ", ".join(
                        top_categories
                    )
                )

            if mechanic_matches:
                score += (
                    sum(
                        preferred_mechanics[
                            mechanic
                        ]
                        for mechanic
                        in mechanic_matches
                    )
                    * 1.5
                )

                top_mechanics = sorted(
                    mechanic_matches,
                    key=lambda mechanic:
                        preferred_mechanics[
                            mechanic
                        ],
                    reverse=True,
                )[:2]

                reasons.append(
                    "Includes "
                    + ", ".join(
                        top_mechanics
                    )
                )

            if game.rating is not None:
                score += (
                    game.rating
                    / 2
                )

            if not reasons:
                reasons.append(
                     "Currently popular on BoardGameGeek"
                )

            recommendations.append(
                {
                    "game": game,
                    "score": round(
                        score,
                        2,
                    ),
                    "reasons": reasons,
                }
            )

        recommendations.sort(
            key=lambda item: (
                -item["score"],
                item["game"].name,
            )
        )

        return recommendations[
            :limit
        ]