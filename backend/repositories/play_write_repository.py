from sqlalchemy.exc import IntegrityError

from database.models import (
    Game as DatabaseGame,
)
from database.models import (
    Play as DatabasePlay,
)
from database.models import (
    PlayParticipant,
    Player,
    UserGame,
)
from models.play import (
    Play as DomainPlay,
)


class PlayWriteRepository:
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
            player = (
                self._get_or_create_player(
                    participant["name"]
                )
            )

            database_play.participants.append(
                PlayParticipant(
                    player_id=player.id,
                    name=player.name,
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
    @staticmethod
    def _normalize_player_name(
        name: str,
    ) -> str:
        return " ".join(
            name.strip().lower().split()
        )


    def _get_or_create_player(
        self,
        name: str,
    ) -> Player:
        if self.user_id is None:
            raise ValueError(
                "user_id is required "
                "to resolve a player"
            )

        cleaned_name = " ".join(
            name.strip().split()
        )

        normalized_name = (
            self._normalize_player_name(
                cleaned_name
            )
        )

        player = (
            self.db.query(Player)
            .filter(
                Player.user_id
                == self.user_id,
                Player.normalized_name
                == normalized_name,
            )
            .first()
        )

        if player is not None:
            return player

        player = Player(
            user_id=self.user_id,
            name=cleaned_name,
            normalized_name=(
                normalized_name
            ),
        )

        self.db.add(player)
        self.db.flush()

        return player

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
            player = (
                self._get_or_create_player(
                    participant["name"]
                )
            )

            database_play.participants.append(
                PlayParticipant(
                    player_id=player.id,
                    name=player.name,
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
            duration_minutes=duration_minutes,
            source=source,
            source_play_id=source_play_id,
        )

        self.db.add(database_play)

        try:
            self.db.flush()
        except IntegrityError:
            self.db.rollback()

            self.enrich_imported_participants(
                source=source,
                source_play_id=source_play_id,
                participants=participants,
            )

            return True

        for participant in participants:
            player = (
                self._get_or_create_player(
                    participant["name"]
                )
            )

            database_play.participants.append(
                PlayParticipant(
                    player_id=player.id,
                    name=player.name,
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
