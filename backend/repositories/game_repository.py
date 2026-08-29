from sqlalchemy.orm import Session

from database.models import Category
from database.models import Game as DatabaseGame
from database.models import Mechanic
from models.game import Game as DomainGame
from database.models import UserGame


class GameRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_owned_by_user(
        self,
        user_id: int,
    ) -> list[DomainGame]:
        database_games = (
            self.db.query(DatabaseGame)
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                UserGame.user_id == user_id
            )
            .order_by(DatabaseGame.name)
            .all()
        )

        games = [
            self._to_domain(game)
            for game in database_games
        ]

        for game in games:
            game.owned = True

        return games


    def get_owned_by_bgg_id(
        self,
        user_id: int,
        bgg_id: int,
    ) -> DomainGame | None:
        database_game = (
            self.db.query(DatabaseGame)
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                UserGame.user_id == user_id,
                DatabaseGame.bgg_id == bgg_id,
            )
            .first()
        )

        if database_game is None:
            return None

        game = self._to_domain(
            database_game
        )

        game.owned = True

        return game


    def add_to_user_collection(
        self,
        user_id: int,
        bgg_id: int,
    ) -> bool:
        database_game = (
            self.db.query(DatabaseGame)
            .filter(
                DatabaseGame.bgg_id == bgg_id
            )
            .first()
        )

        if database_game is None:
            return False

        existing = (
            self.db.query(UserGame)
            .filter(
                UserGame.user_id == user_id,
                UserGame.game_id
                == database_game.id,
            )
            .first()
        )

        if existing is not None:
            return True

        self.db.add(
            UserGame(
                user_id=user_id,
                game_id=database_game.id,
            )
        )

        self.db.commit()

        return True

    def remove_from_user_collection(
        self,
        user_id: int,
        bgg_id: int,
    ) -> bool:
        membership = (
            self.db.query(UserGame)
            .join(
                DatabaseGame,
                DatabaseGame.id
                == UserGame.game_id,
            )
            .filter(
                UserGame.user_id == user_id,
                DatabaseGame.bgg_id == bgg_id,
            )
            .first()
        )

        if membership is None:
            return False

        self.db.delete(membership)
        self.db.commit()

        return True
    
    def get_by_bgg_id(
        self,
        bgg_id: int,
    ) -> DomainGame | None:
        database_game = (
            self.db.query(DatabaseGame)
            .filter(
                DatabaseGame.bgg_id == bgg_id
            )
            .first()
        )

        if database_game is None:
            return None

        return self._to_domain(database_game)

    def get_all(
        self,
    ) -> list[DomainGame]:
        database_games = (
            self.db.query(DatabaseGame)
            .order_by(DatabaseGame.name)
            .all()
        )

        return [
            self._to_domain(game)
            for game in database_games
        ]

    def create(
        self,
        game: DomainGame,
    ) -> DomainGame:
        database_game = DatabaseGame(
            bgg_id=game.bgg_id,
            name=game.name,
            year_published=game.year_published,
            min_players=game.min_players,
            max_players=game.max_players,
            min_play_time=game.min_play_time,
            max_play_time=game.max_play_time,
            complexity=game.complexity,
            rating=game.rating,
            owned=game.owned,
            image_url=game.image_url,
            thumbnail_url=game.thumbnail_url,
            categories=(
                self._get_or_create_categories(
                    game.categories or []
                )
            ),
            mechanics=(
                self._get_or_create_mechanics(
                    game.mechanics or []
                )
            ),
        )

        self.db.add(database_game)
        self.db.commit()
        self.db.refresh(database_game)

        return self._to_domain(database_game)

    def update(
        self,
        game: DomainGame,
    ) -> DomainGame | None:
        database_game = (
            self.db.query(DatabaseGame)
            .filter(
                DatabaseGame.bgg_id == game.bgg_id
            )
            .first()
        )

        if database_game is None:
            return None

        database_game.name = game.name
        database_game.year_published = (
            game.year_published
        )
        database_game.min_players = (
            game.min_players
        )
        database_game.max_players = (
            game.max_players
        )
        database_game.min_play_time = (
            game.min_play_time
        )
        database_game.max_play_time = (
            game.max_play_time
        )
        database_game.complexity = (
            game.complexity
        )
        database_game.rating = game.rating
        database_game.owned = game.owned
        database_game.image_url = (
            game.image_url
        )
        database_game.thumbnail_url = (
            game.thumbnail_url
        )

        database_game.categories = (
            self._get_or_create_categories(
                game.categories or []
            )
        )

        database_game.mechanics = (
            self._get_or_create_mechanics(
                game.mechanics or []
            )
        )

        self.db.commit()
        self.db.refresh(database_game)

        return self._to_domain(database_game)

    def delete(
        self,
        bgg_id: int,
    ) -> bool:
        database_game = (
            self.db.query(DatabaseGame)
            .filter(
                DatabaseGame.bgg_id == bgg_id
            )
            .first()
        )

        if database_game is None:
            return False

        self.db.delete(database_game)
        self.db.commit()

        return True

    def _get_or_create_categories(
        self,
        names: list[str],
    ) -> list[Category]:
        categories = []

        for name in names:
            cleaned_name = name.strip()

            if not cleaned_name:
                continue

            category = (
                self.db.query(Category)
                .filter(
                    Category.name == cleaned_name
                )
                .first()
            )

            if category is None:
                category = Category(
                    name=cleaned_name
                )
                self.db.add(category)

            categories.append(category)

        return categories

    def _get_or_create_mechanics(
        self,
        names: list[str],
    ) -> list[Mechanic]:
        mechanics = []

        for name in names:
            cleaned_name = name.strip()

            if not cleaned_name:
                continue

            mechanic = (
                self.db.query(Mechanic)
                .filter(
                    Mechanic.name == cleaned_name
                )
                .first()
            )

            if mechanic is None:
                mechanic = Mechanic(
                    name=cleaned_name
                )
                self.db.add(mechanic)

            mechanics.append(mechanic)

        return mechanics

    @staticmethod
    def _to_domain(
        database_game: DatabaseGame,
    ) -> DomainGame:
        return DomainGame(
            bgg_id=database_game.bgg_id,
            name=database_game.name,
            year_published=(
                database_game.year_published
            ),
            min_players=database_game.min_players,
            max_players=database_game.max_players,
            min_play_time=(
                database_game.min_play_time
            ),
            max_play_time=(
                database_game.max_play_time
            ),
            complexity=database_game.complexity,
            rating=database_game.rating,
            owned=database_game.owned,
            image_url=database_game.image_url,
            thumbnail_url=(
                database_game.thumbnail_url
            ),
            categories=[
                category.name
                for category
                in database_game.categories
            ],
            mechanics=[
                mechanic.name
                for mechanic
                in database_game.mechanics
            ],
        )