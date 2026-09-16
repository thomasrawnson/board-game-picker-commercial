from dataclasses import dataclass, field, replace
from datetime import datetime, timezone
import random

from models.game import Game
from models.game import PlayerCountPoll
from models.game_play_stats import GamePlayStats


PICKER_MODES = {
    "best_match",
    "different",
    "surprise",
}

MIN_PLAYER_COUNT_POLL_VOTES = 10
PLAYER_COUNT_PENALTY_PERCENT = 30
PLAYER_COUNT_EXCLUSION_PERCENT = 50
PLAYER_COUNT_MIXED_FIT_PENALTY = -15


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
    player_ids: list[int] = field(
        default_factory=list
    )
    mode: str = "best_match"


@dataclass
class PickerMatch:
    game: Game
    score: int
    reasons: list[str]


@dataclass
class PickerNoMatchGuidance:
    player_count_exclusions: int
    can_relax_time: bool
    can_relax_complexity: bool
    can_relax_both: bool


class PickerService:
    def get_no_match_guidance(
        self,
        games: list[Game],
        criteria: PickerCriteria,
    ) -> PickerNoMatchGuidance:
        player_count_exclusions = sum(
            1
            for game in games
            if (
                game.owned
                and self._supports_player_count(
                    game,
                    criteria.players,
                )
                and not self
                ._has_acceptable_player_count_fit(
                    game,
                    criteria.players,
                )
            )
        )

        can_relax_time = (
            criteria.max_play_time is not None
            and bool(
                self.find_matches(
                    games,
                    replace(
                        criteria,
                        max_play_time=None,
                    ),
                )
            )
        )

        can_relax_complexity = (
            criteria.max_complexity is not None
            and bool(
                self.find_matches(
                    games,
                    replace(
                        criteria,
                        max_complexity=None,
                    ),
                )
            )
        )

        can_relax_both = (
            criteria.max_play_time is not None
            and criteria.max_complexity is not None
            and bool(
                self.find_matches(
                    games,
                    replace(
                        criteria,
                        max_play_time=None,
                        max_complexity=None,
                    ),
                )
            )
        )

        return PickerNoMatchGuidance(
            player_count_exclusions=(
                player_count_exclusions
            ),
            can_relax_time=can_relax_time,
            can_relax_complexity=(
                can_relax_complexity
            ),
            can_relax_both=can_relax_both,
        )

    def find_matches(
        self,
        games: list[Game],
        criteria: PickerCriteria,
    ) -> list[Game]:
        matches = []

        for game in games:
            if game.is_expansion:
                continue

            if not game.owned:
                continue

            if not self._supports_player_count(
                game,
                criteria.players,
            ):
                continue

            if not self._has_acceptable_player_count_fit(
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
        group_play_stats: dict[
            int,
            GamePlayStats,
        ]
        | None = None,
    ) -> list[PickerMatch]:
        play_stats = play_stats or {}

        group_play_stats = (
            group_play_stats or {}
        )

        eligible_games = self.find_matches(
            games,
            criteria,
        )

        ranked = [
            self._score_game(
                game,
                criteria,
                play_stats.get(
                    game.bgg_id
                ),
                group_play_stats.get(
                    game.bgg_id
                ),
            )
            for game in eligible_games
        ]

        if criteria.mode == "surprise":
            random.shuffle(ranked)

            return ranked

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
        group_play_stats: GamePlayStats | None = None,
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

        (
            player_count_score,
            player_count_reason,
        ) = self._score_player_count_quality(
            game,
            criteria.players,
        )

        score += player_count_score

        if player_count_reason:
            reasons.append(
                player_count_reason
            )

        (
            play_time_score,
            play_time_reason,
        ) = self._score_play_time(
            game,
            criteria.max_play_time,
        )

        score += play_time_score

        if play_time_reason:
            reasons.append(
                play_time_reason
            )

        (
            complexity_score,
            complexity_reason,
        ) = self._score_complexity(
            game,
            criteria.max_complexity,
        )

        score += complexity_score

        if complexity_reason:
            reasons.append(
                complexity_reason
            )

        (
            history_score,
            history_reasons,
        ) = self._score_play_history(
            play_stats,
            mode=criteria.mode,
        )

        score += history_score

        reasons.extend(
            history_reasons
        )

        (
            preference_score,
            preference_reasons,
        ) = self._score_preferences(
            game,
            criteria,
        )

        score += preference_score

        reasons.extend(
            preference_reasons
        )

        if criteria.player_ids:
            (
                group_score,
                group_reasons,
            ) = self._score_group_history(
                group_play_stats
            )

            score += group_score

            reasons.extend(
                group_reasons
            )

        if criteria.mode == "different":
            reasons.insert(
                0,
                (
                    "Picked to give something "
                    "less familiar a chance"
                ),
            )

        elif criteria.mode == "surprise":
            reasons.insert(
                0,
                (
                    "A wildcard from the games "
                    "that fit tonight"
                ),
            )

        return PickerMatch(
            game=game,
            score=max(
                0,
                min(score, 100),
            ),
            reasons=reasons,
        )

    @staticmethod
    def _score_group_history(
        play_stats: GamePlayStats | None,
    ) -> tuple[
        int,
        list[str],
    ]:
        if (
            play_stats is None
            or play_stats.last_played_at
            is None
        ):
            return (
                10,
                [
                    (
                        "This group hasn't "
                        "played it together yet"
                    ),
                ],
            )

        last_played_at = (
            play_stats.last_played_at
        )

        if (
            last_played_at.tzinfo
            is None
        ):
            last_played_at = (
                last_played_at.replace(
                    tzinfo=timezone.utc
                )
            )

        days_since_played = (
            datetime.now(
                timezone.utc
            )
            - last_played_at
        ).days

        if days_since_played >= 90:
            return (
                8,
                [
                    (
                        "This group hasn't "
                        "played it in over "
                        "3 months"
                    ),
                ],
            )

        if days_since_played >= 30:
            return (
                5,
                [
                    (
                        "This group hasn't "
                        "played it recently"
                    ),
                ],
            )

        if days_since_played >= 14:
            return (
                2,
                [
                    (
                        "It's been a while "
                        "for this group"
                    ),
                ],
            )

        return (
            -6,
            [
                (
                    "This group played it "
                    "recently"
                ),
            ],
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
            game.max_play_time
            / max_play_time,
            1.0,
        )

        score = round(
            10
            + (
                10
                * utilisation
            )
        )

        return (
            score,
            (
                f"Fits within "
                f"{max_play_time} minutes"
            ),
        )

    @staticmethod
    def _score_complexity(
        game: Game,
        max_complexity: float | None,
    ) -> tuple[
        int,
        str | None,
    ]:
        if max_complexity is None:
            return 15, None

        if game.complexity is None:
            return (
                7,
                "Complexity not yet available",
            )

        utilisation = min(
            game.complexity
            / max_complexity,
            1.0,
        )

        score = round(
            7
            + (
                8
                * utilisation
            )
        )

        return (
            score,
            (
                f"Complexity "
                f"{game.complexity:.1f} "
                "fits preference"
            ),
        )

    @staticmethod
    def _score_play_history(
        play_stats: GamePlayStats | None,
        mode: str = "best_match",
    ) -> tuple[
        int,
        list[str],
    ]:
        if (
            play_stats is None
            or play_stats.last_played_at
            is None
        ):
            if mode == "different":
                return (
                    25,
                    [
                        "Hasn't been played yet",
                    ],
                )

            return (
                20,
                [
                    "Hasn't been played yet",
                ],
            )

        now = datetime.now(
            timezone.utc
        )

        last_played_at = (
            play_stats.last_played_at
        )

        if (
            last_played_at.tzinfo
            is None
        ):
            last_played_at = (
                last_played_at.replace(
                    tzinfo=timezone.utc
                )
            )

        days_since_played = (
            now - last_played_at
        ).days

        play_count = (
            play_stats.play_count or 0
        )

        reasons = []

        if mode == "different":
            if days_since_played >= 180:
                score = 23

                reasons.append(
                    (
                        "Hasn't been played in "
                        "over 6 months"
                    )
                )

            elif days_since_played >= 60:
                score = 18

                reasons.append(
                    (
                        "Hasn't been played in "
                        "over 2 months"
                    )
                )

            elif days_since_played >= 14:
                score = 10

                reasons.append(
                    "Due another play"
                )

            else:
                score = 2

                reasons.append(
                    "Played recently"
                )

            if play_count <= 2:
                score += 5

                reasons.append(
                    (
                        "One of your "
                        "least-played games"
                    )
                )

            elif play_count >= 10:
                score -= 6

            return (
                max(score, 0),
                reasons,
            )

        if days_since_played >= 180:
            score = 17

            reasons.append(
                (
                    "Hasn't been played in "
                    "over 6 months"
                )
            )

        elif days_since_played >= 60:
            score = 12

            reasons.append(
                (
                    "Hasn't been played in "
                    "over 2 months"
                )
            )

        elif days_since_played >= 14:
            score = 6

            reasons.append(
                "Due another play"
            )

        else:
            score = 0

            reasons.append(
                "Played recently"
            )

        if (
            play_count <= 2
            and days_since_played >= 14
        ):
            score += 3

            reasons.append(
                "Hasn't had many plays"
            )

        elif play_count >= 10:
            score -= 3

        return (
            max(score, 0),
            reasons,
        )

    @staticmethod
    def _score_preferences(
        game: Game,
        criteria: PickerCriteria,
    ) -> tuple[
        int,
        list[str],
    ]:
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
            category.strip().lower():
                category
            for category
            in (
                game.categories
                or []
            )
            if category.strip()
        }

        game_mechanics = {
            mechanic.strip().lower():
                mechanic
            for mechanic
            in (
                game.mechanics
                or []
            )
            if mechanic.strip()
        }

        matched_categories = [
            game_categories[
                category
            ]
            for category
            in preferred_categories
            if category
            in game_categories
        ]

        matched_mechanics = [
            game_mechanics[
                mechanic
            ]
            for mechanic
            in preferred_mechanics
            if mechanic
            in game_mechanics
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

        return (
            min(score, 10),
            reasons,
        )

    @staticmethod
    def _supports_player_count(
        game: Game,
        players: int,
    ) -> bool:
        if (
            game.min_players is None
            or game.max_players
            is None
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

    @staticmethod
    def _score_player_count_quality(
        game: Game,
        players: int,
    ) -> tuple[
        int,
        str | None,
    ]:
        poll = PickerService._get_player_count_poll(
            game,
            players,
        )

        if poll is None:
            return 0, None

        if (
            poll.total_votes
            < MIN_PLAYER_COUNT_POLL_VOTES
        ):
            return (
                0,
                (
                    "Limited voting data at "
                    f"{players} players"
                ),
            )

        not_recommended_percent = (
            PickerService
            ._not_recommended_percent(poll)
        )

        if (
            poll.not_recommended_votes * 100
            >= poll.total_votes
            * PLAYER_COUNT_PENALTY_PERCENT
        ):
            return (
                PLAYER_COUNT_MIXED_FIT_PENALTY,
                (
                    f"Mixed at {players} players: "
                    f"{PickerService._format_percent(not_recommended_percent)}% "
                    "of voters do not recommend it"
                ),
            )

        if (
            poll.best_votes
            > poll.recommended_votes
            and poll.best_votes
            > poll.not_recommended_votes
        ):
            best_percent = (
                poll.best_votes
                / poll.total_votes
                * 100
            )

            return (
                10,
                (
                    f"Best at {players} players "
                    f"({PickerService._format_percent(best_percent)}% "
                    "of voters)"
                ),
            )

        positive_votes = (
            poll.best_votes
            + poll.recommended_votes
        )

        if positive_votes > poll.not_recommended_votes:
            positive_percent = (
                positive_votes
                / poll.total_votes
                * 100
            )

            return (
                5,
                (
                    f"Recommended at "
                    f"{players} players "
                    f"({PickerService._format_percent(positive_percent)}% "
                    "positive)"
                ),
            )

        return 0, None

    @staticmethod
    def _has_acceptable_player_count_fit(
        game: Game,
        players: int,
    ) -> bool:
        poll = PickerService._get_player_count_poll(
            game,
            players,
        )

        if (
            poll is None
            or poll.total_votes
            < MIN_PLAYER_COUNT_POLL_VOTES
        ):
            return True

        return (
            poll.not_recommended_votes * 100
            < poll.total_votes
            * PLAYER_COUNT_EXCLUSION_PERCENT
        )

    @staticmethod
    def _get_player_count_poll(
        game: Game,
        players: int,
    ) -> PlayerCountPoll | None:
        return next(
            (
                result
                for result in game.player_count_poll
                if result.player_count == players
            ),
            None,
        )

    @staticmethod
    def _not_recommended_percent(
        poll: PlayerCountPoll,
    ) -> float:
        return (
            poll.not_recommended_votes
            / poll.total_votes
            * 100
        )

    @staticmethod
    def _format_percent(
        percent: float,
    ) -> str:
        return (
            f"{percent:.1f}"
            .rstrip("0")
            .rstrip(".")
        )
