from dataclasses import dataclass, field
from datetime import datetime, timezone

from models.game import Game
from models.game_play_stats import GamePlayStats


@dataclass
class PickerCriteria:
    players: int
    max_play_time: int | None = None
    max_complexity: float | None = None
    preferred_categories: list[str] = field(
        default_factory=list
    )
    preferred_mechanics: list[str] = field(
        default_factory=list
    )


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

            if not self._supports_player_count(
                game,
                criteria.players,
            ):
                continue

            if not self._fits_play_time(
                game,
                criteria.max_play_time,
            ):
                continue

            if not self._fits_complexity(
                game,
                criteria.max_complexity,
            ):
                continue

            matches.append(game)

        return matches

    def rank_matches(
        self,
        games: list[Game],
        criteria: PickerCriteria,
        play_stats: dict[
            int,
            GamePlayStats,
        ]
        | None = None,
    ) -> list[PickerMatch]:
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
        score = 35

        reasons = [
            f"Supports {criteria.players} player"
            + (
                ""
                if criteria.players == 1
                else "s"
            )
        ]

        play_time_score, play_time_reason = (
            self._score_play_time(
                game,
                criteria.max_play_time,
            )
        )

        score += play_time_score

        if play_time_reason:
            reasons.append(play_time_reason)

        complexity_score, complexity_reason = (
            self._score_complexity(
                game,
                criteria.max_complexity,
            )
        )

        score += complexity_score

        if complexity_reason:
            reasons.append(complexity_reason)

        history_score, history_reason = (
            self._score_play_history(
                play_stats
            )
        )

        score += history_score

        if history_reason:
            reasons.append(history_reason)

        preference_score, preference_reasons = (
            self._score_preferences(
                game,
                criteria,
            )
        )

        score += preference_score
        reasons.extend(preference_reasons)

        return PickerMatch(
            game=game,
            score=min(score, 100),
            reasons=reasons,
        )

    @staticmethod
    def _score_play_time(
        game: Game,
        max_play_time: int | None,
    ) -> tuple[int, str | None]:
        if max_play_time is None:
            return 20, None

        if game.max_play_time is None:
            return 0, None

        utilisation = min(
            game.max_play_time / max_play_time,
            1.0,
        )

        score = round(
            10 + (10 * utilisation)
        )

        return (
            score,
            f"Fits within {max_play_time} minutes",
        )

    @staticmethod
    def _score_complexity(
        game: Game,
        max_complexity: float | None,
    ) -> tuple[int, str | None]:
        if max_complexity is None:
            return 15, None

        if game.complexity is None:
            return (
                7,
                "Complexity not yet available",
            )

        utilisation = min(
            game.complexity / max_complexity,
            1.0,
        )

        score = round(
            7 + (8 * utilisation)
        )

        return (
            score,
            (
                f"Complexity {game.complexity:.1f} "
                "fits preference"
            ),
        )

    @staticmethod
    def _score_play_history(
        play_stats: GamePlayStats | None,
    ) -> tuple[int, str | None]:
        if (
            play_stats is None
            or play_stats.last_played_at is None
        ):
            return (
                20,
                "Hasn't been played yet",
            )

        now = datetime.now(timezone.utc)

        days_since_played = (
            now - play_stats.last_played_at
        ).days

        if days_since_played >= 180:
            return (
                15,
                (
                    "Hasn't been played in "
                    "over 6 months"
                ),
            )

        if days_since_played >= 60:
            return (
                10,
                (
                    "Hasn't been played in "
                    "over 2 months"
                ),
            )

        if days_since_played >= 14:
            return (
                5,
                "Due another play",
            )

        return (
            0,
            "Played recently",
        )

    @staticmethod
    def _score_preferences(
        game: Game,
        criteria: PickerCriteria,
    ) -> tuple[int, list[str]]:
        preferred_categories = {
            category.strip().lower()
            for category
            in criteria.preferred_categories
            if category.strip()
        }

        preferred_mechanics = {
            mechanic.strip().lower()
            for mechanic
            in criteria.preferred_mechanics
            if mechanic.strip()
        }

        game_categories = {
            category.strip().lower(): category
            for category in (game.categories or [])
            if category.strip()
        }

        game_mechanics = {
            mechanic.strip().lower(): mechanic
            for mechanic in (game.mechanics or [])
            if mechanic.strip()
        }

        matched_categories = [
            game_categories[category]
            for category in preferred_categories
            if category in game_categories
        ]

        matched_mechanics = [
            game_mechanics[mechanic]
            for mechanic in preferred_mechanics
            if mechanic in game_mechanics
        ]

        if (
            not matched_categories
            and not matched_mechanics
        ):
            return 0, []

        score = 0
        reasons = []

        if matched_categories:
            score += 4

            for category in sorted(
                matched_categories
            ):
                reasons.append(
                    (
                        "Matches preferred category: "
                        f"{category}"
                    )
                )

        if matched_mechanics:
            score += 6

            for mechanic in sorted(
                matched_mechanics
            ):
                reasons.append(
                    (
                        "Matches preferred mechanic: "
                        f"{mechanic}"
                    )
                )

        return min(score, 10), reasons

    @staticmethod
    def _supports_player_count(
        game: Game,
        players: int,
    ) -> bool:
        if (
            game.min_players is None
            or game.max_players is None
        ):
            return False

        return (
            game.min_players
            <= players
            <= game.max_players
        )

    @staticmethod
    def _fits_play_time(
        game: Game,
        max_play_time: int | None,
    ) -> bool:
        if max_play_time is None:
            return True

        if game.max_play_time is None:
            return False

        return (
            game.max_play_time
            <= max_play_time
        )

    @staticmethod
    def _fits_complexity(
        game: Game,
        max_complexity: float | None,
    ) -> bool:
        if max_complexity is None:
            return True

        if game.complexity is None:
            return True

        return (
            game.complexity
            <= max_complexity
        )