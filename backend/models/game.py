from dataclasses import (
    dataclass,
    field,
)


@dataclass
class PlayerCountPoll:
    player_count: int
    best_votes: int
    recommended_votes: int
    not_recommended_votes: int
    total_votes: int


@dataclass
class Game:
    bgg_id: int
    name: str

    year_published: int | None = None

    min_players: int | None = None
    max_players: int | None = None

    min_play_time: int | None = None
    max_play_time: int | None = None
    min_age: int | None = None
    min_age_checked: bool = False

    complexity: float | None = None
    rating: float | None = None

    owned: bool = False
    is_expansion: bool = False
    expansion_checked: bool = False

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

    player_count_poll: list[PlayerCountPoll] = field(
        default_factory=list
    )
