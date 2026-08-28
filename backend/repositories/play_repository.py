from sqlalchemy import func
from sqlalchemy.orm import Session

from database.models import (
    Game as DatabaseGame,
)
from database.models import (
    Play as DatabasePlay,
)
from database.models import UserGame
from models.game_play_stats import (
    GamePlayStats,
)
from models.play import (
    Play as DomainPlay,
)


class PlayRepository:
    def __init__(
        self,
        db: Session,
        user_id: int | None = None,
    ):
        self.db = db
        self.user_id = user_id


    def create(
        self,
        bgg_id: int,
        player_count: int,
    ) -> DomainPlay | None:
        if self.user_id is None:
            raise ValueError(
                "user_id is required "
                "to record a play"
            )

        database_game = (
            self.db.query(DatabaseGame)
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                DatabaseGame.bgg_id
                == bgg_id,
                UserGame.user_id
                == self.user_id,
            )
            .first()
        )

        if database_game is None:
            return None

        database_play = DatabasePlay(
            user_id=self.user_id,
            game_id=database_game.id,
            player_count=player_count,
        )

        self.db.add(database_play)
        self.db.commit()
        self.db.refresh(database_play)

        return DomainPlay(
            id=database_play.id,
            bgg_id=database_game.bgg_id,
            player_count=(
                database_play.player_count
            ),
            played_at=(
                database_play.played_at
            ),
        )


    def exists_by_source_play_id(
        self,
        source: str,
        source_play_id: str,
    ) -> bool:
        if self.user_id is None:
            return False

        return (
            self.db.query(DatabasePlay.id)
            .filter(
                DatabasePlay.user_id
                == self.user_id,
                DatabasePlay.source
                == source,
                DatabasePlay.source_play_id
                == source_play_id,
            )
            .first()
            is not None
        )


    def create_imported(
        self,
        bgg_id: int,
        player_count: int,
        played_at,
        duration_minutes: int | None,
        source: str,
        source_play_id: str,
    ) -> bool:
        if self.user_id is None:
            raise ValueError(
                "user_id is required "
                "to import plays"
            )

        database_game = (
            self.db.query(DatabaseGame)
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                DatabaseGame.bgg_id
                == bgg_id,
                UserGame.user_id
                == self.user_id,
            )
            .first()
        )

        if database_game is None:
            return False

        database_play = DatabasePlay(
            user_id=self.user_id,
            game_id=database_game.id,
            player_count=player_count,
            played_at=played_at,
            duration_minutes=(
                duration_minutes
            ),
            source=source,
            source_play_id=(
                source_play_id
            ),
        )

        self.db.add(database_play)
        self.db.commit()

        return True


    def get_game_play_stats(
        self,
    ) -> dict[int, GamePlayStats]:
        if self.user_id is None:
            return {}

        rows = (
            self.db.query(
                DatabaseGame.bgg_id,
                func.count(
                    DatabasePlay.id
                ).label("play_count"),
                func.max(
                    DatabasePlay.played_at
                ).label("last_played_at"),
            )
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .outerjoin(
                DatabasePlay,
                (
                    DatabasePlay.game_id
                    == DatabaseGame.id
                )
                & (
                    DatabasePlay.user_id
                    == self.user_id
                ),
            )
            .filter(
                UserGame.user_id
                == self.user_id
            )
            .group_by(
                DatabaseGame.id,
                DatabaseGame.bgg_id,
            )
            .all()
        )

        return {
            row.bgg_id: GamePlayStats(
                bgg_id=row.bgg_id,
                play_count=row.play_count,
                last_played_at=(
                    row.last_played_at
                ),
            )
            for row in rows
        }