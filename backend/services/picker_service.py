from dataclasses import dataclass
from datetime import datetime, timezone
from models.game_play_stats import GamePlayStats
from models.game import Game


@dataclass
class PickerCriteria:
    players: int
    max_play_time: int | None = None
    max_complexity: float | None = None


@dataclass
class PickerMatch:
    game: Game
    score: int
    reasons: list[str]


class PickerService:
    def find_matches(
        self,
        games: list[Game],
        criteria: PickerCriteria,
    ) -> list[Game]:
        matches = []

        for game in games:
            if not game.owned:
                continue

            if not self._supports_player_count(game, criteria.players):
                continue

            if not self._fits_play_time(game, criteria.max_play_time):
                continue

            if not self._fits_complexity(game, criteria.max_complexity):
                continue

            matches.append(game)

        return matches

    def rank_matches(
        self,
        games,
        criteria,
        play_stats=None,
    ):
        play_stats = play_stats or {}

        eligible_games = self.find_matches(
            games,
            criteria,
        )

        ranked = [
            self._score_game(
                game,
                criteria,
                play_stats.get(game.bgg_id),
            )
            for game in eligible_games
        ]

        return sorted(
            ranked,
            key=lambda match: (
                -match.score,
                match.game.name,
            ),
        )

    def _score_game(
        self,
        game: Game,
        criteria: PickerCriteria,
        play_stats: GamePlayStats | None = None,
        ) -> PickerMatch:
        score = 40
        reasons = [
            f"Supports {criteria.players} player"
            + ("" if criteria.players == 1 else "s")
        ]

        if criteria.max_play_time is None:
            score += 25
        elif game.max_play_time is not None:
            utilisation = min(
                game.max_play_time / criteria.max_play_time,
                1.0,
            )

            score += round(15 + (10 * utilisation))

            reasons.append(
                f"Fits within {criteria.max_play_time} minutes"
            )

        if criteria.max_complexity is None:
            score += 15
        elif game.complexity is None:
            score += 7
            reasons.append("Complexity not yet available")
        else:
            utilisation = min(
                game.complexity / criteria.max_complexity,
                1.0,
            )

            score += round(7 + (8 * utilisation))

            reasons.append(
                f"Complexity {game.complexity:.1f} fits preference"
            )

        history_score, history_reason = self._score_play_history(
            play_stats
        )

        score += history_score

        if history_reason:
            reasons.append(history_reason)

        return PickerMatch(
            game=game,
            score=min(score, 100),
            reasons=reasons,
    )

    @staticmethod
    def _supports_player_count(game: Game, players: int) -> bool:
        if game.min_players is None or game.max_players is None:
            return False

        return game.min_players <= players <= game.max_players

    @staticmethod
    def _fits_play_time(
        game: Game,
        max_play_time: int | None,
    ) -> bool:
        if max_play_time is None:
            return True

        if game.max_play_time is None:
            return False

        return game.max_play_time <= max_play_time

    @staticmethod
    def _fits_complexity(
        game: Game,
        max_complexity: float | None,
    ) -> bool:
        if max_complexity is None:
            return True

        if game.complexity is None:
            return True

        return game.complexity <= max_complexity

    @staticmethod
    def _score_play_history(
        play_stats: GamePlayStats | None,
    ) -> tuple[int, str | None]:
        if (
            play_stats is None
            or play_stats.last_played_at is None
        ):
            return 20, "Hasn't been played yet"

        now = datetime.now(timezone.utc)

        days_since_played = (
            now - play_stats.last_played_at
        ).days

        if days_since_played >= 180:
            return 15, "Hasn't been played in over 6 months"

        if days_since_played >= 60:
            return 10, "Hasn't been played in over 2 months"

        if days_since_played >= 14:
            return 5, "Due another play"

        return 0, "Played recently"
