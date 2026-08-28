from models.game import Game
from repositories.game_repository import (
    GameRepository,
)


class GameService:
    def __init__(
        self,
        repository: GameRepository,
        user_id: int | None = None,
    ):
        self.repository = repository
        self.user_id = user_id


    def get_game(
        self,
        bgg_id: int,
    ) -> Game | None:
        if self.user_id is not None:
            return (
                self.repository
                .get_owned_by_bgg_id(
                    self.user_id,
                    bgg_id,
                )
            )

        return (
            self.repository
            .get_by_bgg_id(bgg_id)
        )


    def get_games(self) -> list[Game]:
        if self.user_id is not None:
            return (
                self.repository
                .get_owned_by_user(
                    self.user_id
                )
            )

        return self.repository.get_all()


    def create_game(
        self,
        game: Game,
    ) -> Game:
        return self.repository.create(game)


    def update_game(
        self,
        game: Game,
    ) -> Game | None:
        return self.repository.update(game)


    def delete_game(
        self,
        bgg_id: int,
    ) -> bool:
        return self.repository.delete(
            bgg_id
        )