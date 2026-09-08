from sqlalchemy import case, func
from sqlalchemy.orm import Session

from database.models import (
    Game,
    Play,
    PlayParticipant,
    Player,
    UserGame,
)
from models.collection_insights import (
    GamePlaySummary,
    LastPlayedGame,
    MonthlyActivity,
    MonthlyPlay,
    NeglectedGame,
    PlayerGroupSummary,
    PlayerSummary,
    PlayerTopGame,
)
from datetime import (
    datetime,
    timezone,
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
                Player.id,
                Player.name,
                func.count(
                    PlayParticipant.id
                ).label(
                    "play_count"
                ),
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
                ).label(
                    "win_count"
                ),
            )
            .join(
                PlayParticipant,
                PlayParticipant.player_id
                == Player.id,
            )
            .join(
                Play,
                Play.id
                == PlayParticipant.play_id,
            )
            .filter(
                Player.user_id
                == self.user_id,
                Play.user_id
                == self.user_id,
            )
            .group_by(
                Player.id,
                Player.name,
            )
            .order_by(
                func.count(
                    PlayParticipant.id
                ).desc(),
                Player.name,
            )
            .limit(limit)
            .all()
        )

        return [
            PlayerSummary(
                id=row.id,
                name=row.name,
                play_count=row.play_count,
                win_count=(
                    row.win_count or 0
                ),
            )
            for row in rows
        ]

    def get_monthly_activity(
        self,
    ) -> MonthlyActivity:
        if self.user_id is None:
            return MonthlyActivity(
                plays=0,
                unique_games=0,
                new_games=0,
                repeat_plays=0,
                recent_plays=[],
            )

        now = datetime.now(
            timezone.utc
        )

        month_start = datetime(
            now.year,
            now.month,
            1,
            tzinfo=timezone.utc,
        )

        plays_this_month = (
            self.db.query(
                func.count(
                    Play.id
                )
            )
            .filter(
                Play.user_id
                == self.user_id,
                Play.played_at
                >= month_start,
            )
            .scalar()
            or 0
        )

        unique_games = (
            self.db.query(
                func.count(
                    func.distinct(
                        Play.game_id
                    )
                )
            )
            .filter(
                Play.user_id
                == self.user_id,
                Play.played_at
                >= month_start,
            )
            .scalar()
            or 0
        )

        first_play_dates = (
            self.db.query(
                Play.game_id.label(
                    "game_id"
                ),
                func.min(
                    Play.played_at
                ).label(
                    "first_played_at"
                ),
            )
            .filter(
                Play.user_id
                == self.user_id
            )
            .group_by(
                Play.game_id
            )
            .subquery()
        )

        new_games = (
            self.db.query(
                func.count()
            )
            .select_from(
                first_play_dates
            )
            .filter(
                first_play_dates
                .c
                .first_played_at
                >= month_start
            )
            .scalar()
            or 0
        )

        repeat_plays = max(
            plays_this_month
            - new_games,
            0,
        )

        recent_rows = (
            self.db.query(
                Play.id,
                Game.bgg_id,
                Game.name,
                Play.played_at,
                Play.player_count,
            )
            .join(
                Game,
                Game.id == Play.game_id,
            )
            .filter(
                Play.user_id
                == self.user_id,
                Play.played_at
                >= month_start,
            )
            .order_by(
                Play.played_at.desc()
            )
            .limit(20)
            .all()
        )

        recent_plays = [
            MonthlyPlay(
                play_id=row.id,
                bgg_id=row.bgg_id,
                game_name=row.name,
                played_at=row.played_at,
                player_count=row.player_count,
            )
            for row in recent_rows
        ]
        return MonthlyActivity(
            plays=plays_this_month,
            unique_games=unique_games,
            new_games=new_games,
            repeat_plays=repeat_plays,
            recent_plays=recent_plays,
        )


    def get_neglected_games(
        self,
        limit: int = 5,
    ) -> list[NeglectedGame]:
        if self.user_id is None:
            return []

        rows = (
            self.db.query(
                Game.bgg_id,
                Game.name,
                func.count(
                    Play.id
                ).label(
                    "play_count"
                ),
                func.max(
                    Play.played_at
                ).label(
                    "last_played_at"
                ),
            )
            .join(
                UserGame,
                UserGame.game_id
                == Game.id,
            )
            .outerjoin(
                Play,
                (
                    Play.game_id
                    == Game.id
                )
                & (
                    Play.user_id
                    == self.user_id
                ),
            )
            .filter(
                UserGame.user_id
                == self.user_id
            )
            .group_by(
                Game.id,
                Game.bgg_id,
                Game.name,
            )
            .order_by(
                case(
                    (
                        func.count(
                            Play.id
                        )
                        == 0,
                        0,
                    ),
                    else_=1,
                ),
                func.max(
                    Play.played_at
                ).asc(),
                func.count(
                    Play.id
                ).asc(),
                Game.name,
            )
            .limit(limit)
            .all()
        )

        return [
            NeglectedGame(
                bgg_id=row.bgg_id,
                name=row.name,
                play_count=(
                    row.play_count or 0
                ),
                last_played_at=(
                    row.last_played_at
                ),
            )
            for row in rows
        ]


    def get_top_games_by_player(
        self,
        limit: int = 5,
    ) -> list[PlayerTopGame]:
        if self.user_id is None:
            return []

        ranked_rows = (
            self.db.query(
                Player.id.label(
                    "player_id"
                ),
                Player.name.label(
                    "player_name"
                ),
                Game.bgg_id.label(
                    "bgg_id"
                ),
                Game.name.label(
                    "game_name"
                ),
                func.count(
                    Play.id
                ).label(
                    "play_count"
                ),
                func.row_number().over(
                    partition_by=Player.id,
                    order_by=(
                        func.count(
                            Play.id
                        ).desc()
                    ),
                ).label(
                    "row_number"
                ),
            )
            .join(
                PlayParticipant,
                PlayParticipant.player_id
                == Player.id,
            )
            .join(
                Play,
                Play.id
                == PlayParticipant.play_id,
            )
            .join(
                Game,
                Game.id
                == Play.game_id,
            )
            .filter(
                Player.user_id
                == self.user_id,
                Play.user_id
                == self.user_id,
            )
            .group_by(
                Player.id,
                Player.name,
                Game.id,
                Game.bgg_id,
                Game.name,
            )
            .subquery()
        )

        rows = (
            self.db.query(
                ranked_rows
            )
            .filter(
                ranked_rows
                .c
                .row_number
                == 1
            )
            .order_by(
                ranked_rows
                .c
                .play_count
                .desc(),
                ranked_rows
                .c
                .player_name,
            )
            .limit(limit)
            .all()
        )

        return [
            PlayerTopGame(
                player_id=(
                    row.player_id
                ),
                player_name=(
                    row.player_name
                ),
                bgg_id=(
                    row.bgg_id
                ),
                game_name=(
                    row.game_name
                ),
                play_count=(
                    row.play_count
                ),
            )
            for row in rows
        ]


    def get_common_groups(
        self,
        limit: int = 5,
    ) -> list[PlayerGroupSummary]:
        if self.user_id is None:
            return []

        plays = (
            self.db.query(
                Play
            )
            .filter(
                Play.user_id
                == self.user_id
            )
            .order_by(
                Play.played_at.desc()
            )
            .all()
        )

        groups: dict[
            tuple[int, ...],
            dict,
        ] = {}

        for play in plays:
            players = [
                participant.player
                for participant
                in play.participants
                if participant.player
                is not None
            ]

            unique_players = {
                player.id:
                    player
                for player
                in players
            }

            if len(
                unique_players
            ) < 2:
                continue

            sorted_players = sorted(
                unique_players.values(),
                key=lambda player:
                    player.id,
            )

            key = tuple(
                player.id
                for player
                in sorted_players
            )

            if key not in groups:
                groups[key] = {
                    "player_ids": [
                        player.id
                        for player
                        in sorted_players
                    ],
                    "player_names": [
                        player.name
                        for player
                        in sorted_players
                    ],
                    "play_count": 0,
                }

            groups[
                key
            ]["play_count"] += 1

        ranked_groups = sorted(
            groups.values(),
            key=lambda group: (
                -group[
                    "play_count"
                ],
                group[
                    "player_names"
                ],
            ),
        )[:limit]

        return [
            PlayerGroupSummary(
                player_ids=(
                    group[
                        "player_ids"
                    ]
                ),
                player_names=(
                    group[
                        "player_names"
                    ]
                ),
                play_count=(
                    group[
                        "play_count"
                    ]
                ),
            )
            for group
            in ranked_groups
        ]