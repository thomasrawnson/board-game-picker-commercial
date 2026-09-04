from dataclasses import dataclass
from datetime import datetime


@dataclass
class GamePlaySummary:
    bgg_id: int
    name: str
    play_count: int


@dataclass
class LastPlayedGame:
    bgg_id: int
    name: str
    played_at: datetime


@dataclass
class PlayerSummary:
    name: str
    play_count: int
    win_count: int


@dataclass
class CollectionInsights:
    total_games: int
    total_plays: int
    played_games_count: int
    collection_played_percentage: int
    total_duration_minutes: int
    average_duration_minutes: int | None
    most_played: GamePlaySummary | None
    last_played: LastPlayedGame | None
    never_played_count: int
    frequent_players: list[PlayerSummary]