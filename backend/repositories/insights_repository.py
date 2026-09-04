from sqlalchemy import case, func
from sqlalchemy.orm import Session

from database.models import (
    Game,
    Play,
    PlayParticipant,
    UserGame,
)
from models.collection_insights import (
    GamePlaySummary,
    LastPlayedGame,
    PlayerSummary,
)


class InsightsRepository:
    def __init__(
        self,
        db: Session,
        user_id: int | None = None,
    ):
        self.db = db
        self.user_id = user_id

    def total_owned_games(self) -> int:
        if self.user_id is None:
            return 0

        return (
            self.db.query(
                func.count(UserGame.game_id)
            )
            .filter(
                UserGame.user_id
                == self.user_id
            )
            .scalar()
            or 0
        )

    def total_plays(self) -> int:
        if self.user_id is None:
            return 0

        return (
            self.db.query(
                func.count(Play.id)
            )
            .filter(
                Play.user_id
                == self.user_id
            )
            .scalar()
            or 0
        )

    def played_games_count(self) -> int:
        if self.user_id is None:
            return 0

        return (
            self.db.query(
                func.count(
                    func.distinct(
                        Play.game_id
                    )
                )
            )
            .join(
                UserGame,
                UserGame.game_id
                == Play.game_id,
            )
            .filter(
                Play.user_id
                == self.user_id,
                UserGame.user_id
                == self.user_id,
            )
            .scalar()
            or 0
        )

    def total_duration_minutes(self) -> int:
        if self.user_id is None:
            return 0

        return (
            self.db.query(
                func.sum(
                    Play.duration_minutes
                )
            )
            .filter(
                Play.user_id
                == self.user_id
            )
            .scalar()
            or 0
        )

    def average_duration_minutes(
        self,
    ) -> int | None:
        if self.user_id is None:
            return None

        result = (
            self.db.query(
                func.avg(
                    Play.duration_minutes
                )
            )
            .filter(
                Play.user_id
                == self.user_id,
                Play.duration_minutes
                .is_not(None),
            )
            .scalar()
        )

        if result is None:
            return None

        return round(float(result))

    def get_most_played(
        self,
    ) -> GamePlaySummary | None:
        if self.user_id is None:
            return None

        result = (
            self.db.query(
                Game.bgg_id,
                Game.name,
                func.count(
                    Play.id
                ).label("play_count"),
            )
            .join(
                UserGame,
                UserGame.game_id
                == Game.id,
            )
            .join(
                Play,
                Play.game_id == Game.id,
            )
            .filter(
                UserGame.user_id
                == self.user_id,
                Play.user_id
                == self.user_id,
            )
            .group_by(
                Game.id,
                Game.bgg_id,
                Game.name,
            )
            .order_by(
                func.count(
                    Play.id
                ).desc(),
                Game.name,
            )
            .first()
        )

        if result is None:
            return None

        return GamePlaySummary(
            bgg_id=result.bgg_id,
            name=result.name,
            play_count=result.play_count,
        )

    def get_last_played(
        self,
    ) -> LastPlayedGame | None:
        if self.user_id is None:
            return None

        result = (
            self.db.query(
                Game.bgg_id,
                Game.name,
                Play.played_at,
            )
            .join(
                UserGame,
                UserGame.game_id
                == Game.id,
            )
            .join(
                Play,
                Play.game_id == Game.id,
            )
            .filter(
                UserGame.user_id
                == self.user_id,
                Play.user_id
                == self.user_id,
            )
            .order_by(
                Play.played_at.desc()
            )
            .first()
        )

        if result is None:
            return None

        return LastPlayedGame(
            bgg_id=result.bgg_id,
            name=result.name,
            played_at=result.played_at,
        )

    def never_played_count(self) -> int:
        if self.user_id is None:
            return 0

        played_game_ids = (
            self.db.query(
                Play.game_id
            )
            .filter(
                Play.user_id
                == self.user_id
            )
        )

        return (
            self.db.query(
                func.count(
                    UserGame.game_id
                )
            )
            .filter(
                UserGame.user_id
                == self.user_id,
                ~UserGame.game_id.in_(
                    played_game_ids
                ),
            )
            .scalar()
            or 0
        )

    def get_frequent_players(
        self,
        limit: int = 5,
    ) -> list[PlayerSummary]:
        if self.user_id is None:
            return []

        rows = (
            self.db.query(
                PlayParticipant.name,
                func.count(
                    PlayParticipant.id
                ).label("play_count"),
                func.sum(
                    case(
                        (
                            PlayParticipant
                            .is_winner
                            .is_(True),
                            1,
                        ),
                        else_=0,
                    )
                ).label("win_count"),
            )
            .join(
                Play,
                Play.id
                == PlayParticipant.play_id,
            )
            .filter(
                Play.user_id
                == self.user_id,
                PlayParticipant.name
                .is_not(None),
                PlayParticipant.name != "",
            )
            .group_by(
                PlayParticipant.name
            )
            .order_by(
                func.count(
                    PlayParticipant.id
                ).desc(),
                PlayParticipant.name,
            )
            .limit(limit)
            .all()
        )

        return [
            PlayerSummary(
                name=row.name,
                play_count=row.play_count,
                win_count=(
                    row.win_count or 0
                ),
            )
            for row in rows
        ]