from sqlalchemy import func
from sqlalchemy.orm import Session

from database.models import (
    Game as DatabaseGame,
)
from database.models import (
    Play as DatabasePlay,
)
from database.models import (
    PlayParticipant,
    UserGame,
)
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
        played_at,
        duration_minutes: int | None,
        participants: list[dict],
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
            player_count=len(participants),
            duration_minutes=duration_minutes,
        )

        if played_at is not None:
            database_play.played_at = played_at

        self.db.add(database_play)
        self.db.flush()

        for participant in participants:
            database_play.participants.append(
                PlayParticipant(
                    name=participant["name"],
                    score=participant.get(
                        "score"
                    ),
                    is_winner=participant.get(
                        "is_winner",
                        False,
                    ),
                )
            )

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

    def enrich_imported_participants(
        self,
        source: str,
        source_play_id: str,
        participants: list[dict],
    ) -> bool:
        if self.user_id is None:
            return False

        database_play = (
            self.db.query(DatabasePlay)
            .filter(
                DatabasePlay.user_id
                == self.user_id,
                DatabasePlay.source
                == source,
                DatabasePlay.source_play_id
                == source_play_id,
            )
            .first()
        )

        if database_play is None:
            return False

        if database_play.participants:
            return False

        for participant in participants:
            database_play.participants.append(
                PlayParticipant(
                    name=participant["name"],
                    score=participant.get(
                        "score"
                    ),
                    is_winner=participant.get(
                        "is_winner",
                        False,
                    ),
                )
            )

        database_play.player_count = len(
            participants
        )

        self.db.commit()

        return True
    def create_imported(
        self,
        bgg_id: int,
        player_count: int,
        played_at,
        duration_minutes: int | None,
        source: str,
        source_play_id: str,
        participants: list[dict],
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
        self.db.flush()

        for participant in participants:
            database_play.participants.append(
                PlayParticipant(
                    name=participant["name"],
                    score=participant.get(
                        "score"
                    ),
                    is_winner=participant.get(
                        "is_winner",
                        False,
                    ),
                )
            )

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

    def get_for_game(
        self,
        bgg_id: int,
        limit: int = 10,
    ):
        if self.user_id is None:
            return []

        rows = (
            self.db.query(
                DatabasePlay,
                DatabaseGame.bgg_id,
            )
            .join(
                DatabaseGame,
                DatabaseGame.id
                == DatabasePlay.game_id,
            )
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                DatabasePlay.user_id
                == self.user_id,
                UserGame.user_id
                == self.user_id,
                DatabaseGame.bgg_id
                == bgg_id,
            )
            .order_by(
                DatabasePlay.played_at.desc()
            )
            .limit(limit)
            .all()
        )

        return [
            {
                "id": play.id,
                "bgg_id": game_bgg_id,
                "player_count": (
                    play.player_count
                ),
                "played_at": (
                    play.played_at
                ),
                "duration_minutes": (
                    play.duration_minutes
                ),
                "source": play.source,
            }
            for play, game_bgg_id in rows
        ]

    def get_game_history(
        self,
        bgg_id: int,
        limit: int = 10,
    ):
        if self.user_id is None:
            return None

        database_game = (
            self.db.query(DatabaseGame)
            .join(
                UserGame,
                UserGame.game_id
                == DatabaseGame.id,
            )
            .filter(
                DatabaseGame.bgg_id == bgg_id,
                UserGame.user_id
                == self.user_id,
            )
            .first()
        )

        if database_game is None:
            return None

        plays = (
            self.db.query(DatabasePlay)
            .filter(
                DatabasePlay.user_id
                == self.user_id,
                DatabasePlay.game_id
                == database_game.id,
            )
            .order_by(
                DatabasePlay.played_at.desc()
            )
            .limit(limit)
            .all()
        )

        summary = (
            self.db.query(
                func.count(
                    DatabasePlay.id
                ).label("play_count"),
                func.max(
                    DatabasePlay.played_at
                ).label("last_played_at"),
                func.avg(
                    DatabasePlay.player_count
                ).label("average_players"),
                func.avg(
                    DatabasePlay.duration_minutes
                ).label("average_duration"),
            )
            .filter(
                DatabasePlay.user_id
                == self.user_id,
                DatabasePlay.game_id
                == database_game.id,
            )
            .one()
        )

        return {
            "bgg_id": bgg_id,
            "play_count": (
                summary.play_count or 0
            ),
            "last_played_at": (
                summary.last_played_at
            ),
            "average_players": (
                float(summary.average_players)
                if summary.average_players
                is not None
                else None
            ),
            "average_duration_minutes": (
                round(
                    float(
                        summary.average_duration
                    )
                )
                if summary.average_duration
                is not None
                else None
            ),
            "recent_plays": [
                {
                    "id": play.id,
                    "played_at": play.played_at,
                    "player_count": (
                        play.player_count
                    ),
                    "duration_minutes": (
                        play.duration_minutes
                    ),
                    "source": play.source,
                    "participants": [
                        {
                            "id": participant.id,
                            "name": (
                                participant.name
                            ),
                            "score": (
                                participant.score
                            ),
                            "is_winner": (
                                participant.is_winner
                            ),
                        }
                        for participant
                        in play.participants
                    ],
                }
                for play in plays
            ],
        }

    def get_collection_stats(
        self,
    ):
        if self.user_id is None:
            return []

        rows = (
            self.db.query(
                DatabaseGame.bgg_id,
                func.count(
                    DatabasePlay.id
                ).label(
                    "play_count"
                ),
                func.max(
                    DatabasePlay.played_at
                ).label(
                    "last_played_at"
                ),
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

        return [
            {
                "bgg_id": row.bgg_id,
                "play_count": (
                    row.play_count or 0
                ),
                "last_played_at": (
                    row.last_played_at
                ),
            }
            for row in rows
    ]