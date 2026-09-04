import json

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class BGStatsParticipant:
    name: str
    score: float | None
    is_winner: bool


@dataclass(frozen=True)
class BGStatsPlay:
    source_play_id: str
    bgg_id: int
    player_count: int
    played_at: datetime
    duration_minutes: int | None
    participants: list[BGStatsParticipant]


def parse_bgstats_plays(
    json_text: str,
) -> list[BGStatsPlay]:
    data = json.loads(json_text)

    games_by_ref_id = {
        game["id"]: game["bggId"]
        for game in data.get("games", [])
        if game.get("id") is not None
        and game.get("bggId")
    }

    players_by_ref_id = {
        player["id"]: player.get("name")
        for player in data.get("players", [])
        if player.get("id") is not None
    }

    plays: list[BGStatsPlay] = []

    for item in data.get("plays", []):
        if item.get("ignored"):
            continue

        source_play_id = item.get("uuid")

        if not source_play_id:
            continue

        game_ref_id = item.get("gameRefId")
        bgg_id = games_by_ref_id.get(game_ref_id)

        if not bgg_id:
            continue

        play_date = item.get("playDate")

        if not play_date:
            continue

        participant_rows = []

        for player_score in (
            item.get("playerScores") or []
        ):
            player_ref_id = (
                player_score.get("playerRefId")
            )

            name = players_by_ref_id.get(
                player_ref_id
            )

            if not name:
                name = "Unknown player"

            participant_rows.append(
                BGStatsParticipant(
                    name=name,
                    score=_parse_score(
                        player_score.get("score")
                    ),
                    is_winner=bool(
                        player_score.get("winner")
                    ),
                )
            )

        if not participant_rows:
            continue

        played_at = _parse_datetime(
            play_date
        )

        plays.append(
            BGStatsPlay(
                source_play_id=source_play_id,
                bgg_id=bgg_id,
                player_count=len(
                    participant_rows
                ),
                played_at=played_at,
                duration_minutes=item.get(
                    "durationMin"
                ),
                participants=participant_rows,
            )
        )

    return plays


def _parse_score(
    value,
) -> float | None:
    if value is None:
        return None

    if isinstance(
        value,
        str,
    ):
        value = value.strip()

        if not value:
            return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(
        value.replace("Z", "+00:00")
    )

    if parsed.tzinfo is None:
        parsed = parsed.replace(
            tzinfo=timezone.utc
        )

    return parsed