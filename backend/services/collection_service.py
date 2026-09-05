from bgg.client import BGGClient
from bgg.collection_parser import (
    parse_collection_ids,
)
from bgg.game_parser import (
    parse_game_metadata,
    parse_games_metadata,
)
from repositories.game_repository import (
    GameRepository,
)


THING_BATCH_SIZE = 20


class CollectionService:
    def __init__(
        self,
        bgg_client: BGGClient,
        repository: GameRepository,
        user_id: int | None = None,
    ):
        self.bgg_client = (
            bgg_client
        )
        self.repository = (
            repository
        )
        self.user_id = user_id


    def sync_game(
        self,
        bgg_id: int,
    ):
        xml = (
            self.bgg_client
            .get_game(bgg_id)
        )

        game = (
            parse_game_metadata(
                xml
            )
        )

        existing_game = (
            self.repository
            .get_by_bgg_id(
                game.bgg_id
            )
        )

        if existing_game is None:
            return (
                self.repository
                .create(game)
            )

        return (
            self.repository
            .update(game)
        )


    def sync_collection(
        self,
        username: str,
    ):
        xml = (
            self.bgg_client
            .get_collection(
                username
            )
        )

        bgg_ids = (
            parse_collection_ids(
                xml
            )
        )

        existing_ids = (
            self.repository
            .get_existing_bgg_ids(
                bgg_ids
            )
        )

        missing_ids = [
            bgg_id
            for bgg_id in bgg_ids
            if bgg_id
            not in existing_ids
        ]

        self._sync_missing_games(
            missing_ids
        )

        games = []

        for bgg_id in bgg_ids:
            game = (
                self.repository
                .get_by_bgg_id(
                    bgg_id
                )
            )

            if game is None:
                continue

            if (
                self.user_id
                is not None
            ):
                (
                    self.repository
                    .add_to_user_collection(
                        self.user_id,
                        game.bgg_id,
                    )
                )

            games.append(game)

        return games


    def _sync_missing_games(
        self,
        bgg_ids: list[int],
    ) -> None:
        for batch in (
            self._batches(
                bgg_ids,
                THING_BATCH_SIZE,
            )
        ):
            xml = (
                self.bgg_client
                .get_games(batch)
            )

            games = (
                parse_games_metadata(
                    xml
                )
            )

            for game in games:
                existing_game = (
                    self.repository
                    .get_by_bgg_id(
                        game.bgg_id
                    )
                )

                if (
                    existing_game
                    is None
                ):
                    self.repository.create(
                        game
                    )
                else:
                    self.repository.update(
                        game
                    )


    @staticmethod
    def _batches(
        values: list[int],
        size: int,
    ):
        for index in range(
            0,
            len(values),
            size,
        ):
            yield values[
                index:
                index + size
            ]