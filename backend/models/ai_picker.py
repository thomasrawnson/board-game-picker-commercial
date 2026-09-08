from dataclasses import dataclass


@dataclass
class AiPickerCandidate:
    bgg_id: int
    name: str
    deterministic_score: int

    min_players: int | None
    max_players: int | None

    min_play_time: int | None
    max_play_time: int | None

    complexity: float | None

    categories: list[str]
    mechanics: list[str]

    deterministic_reasons: list[str]


@dataclass
class AiPickerRecommendation:
    bgg_id: int
    ai_rank: int
    explanation: str


@dataclass
class AiPickerResult:
    recommendations: list[
        AiPickerRecommendation
    ]

    used_ai: bool

    fallback_reason: str | None = None