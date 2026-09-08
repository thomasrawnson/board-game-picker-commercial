from dataclasses import (
    dataclass,
    field,
)


@dataclass
class Game:
    bgg_id: int
    name: str

    year_published: int | None = None

    min_players: int | None = None
    max_players: int | None = None

    min_play_time: int | None = None
    max_play_time: int | None = None

    complexity: float | None = None
    rating: float | None = None

    owned: bool = False

    image_url: str | None = None
    thumbnail_url: str | None = None

    categories: list[str] = field(
        default_factory=list
    )

    mechanics: list[str] = field(
        default_factory=list
    )

    best_player_counts: list[int] = field(
        default_factory=list
    )

    recommended_player_counts: list[int] = field(
        default_factory=list
    )