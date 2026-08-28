from bgg.client import BGGClient
from bgg.collection_parser import (
    parse_collection_ids,
)
from bgg.game_parser import (
    parse_game_metadata,
)
from repositories.game_repository import (
    GameRepository,
)


class CollectionService:
    def __init__(
        self,
        bgg_client: BGGClient,
        repository: GameRepository,
        user_id: int | None = None,
    ):
        self.bgg_client = bgg_client
        self.repository = repository
        self.user_id = user_id


    def sync_game(
        self,
        bgg_id: int,
    ):
        xml = self.bgg_client.get_game(
            bgg_id
        )

        game = parse_game_metadata(xml)

        existing_game = (
            self.repository
            .get_by_bgg_id(game.bgg_id)
        )

        if existing_game is None:
            return self.repository.create(
                game
            )

        return self.repository.update(game)


    def sync_collection(
        self,
        username: str,
    ):
        xml = (
            self.bgg_client
            .get_collection(username)
        )

        bgg_ids = parse_collection_ids(xml)

        games = []

        for bgg_id in bgg_ids:
            game = self.sync_game(bgg_id)

            if self.user_id is not None:
                (
                    self.repository
                    .add_to_user_collection(
                        self.user_id,
                        game.bgg_id,
                    )
                )

            games.append(game)

        return games