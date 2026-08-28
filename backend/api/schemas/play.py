from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class PlayParticipantCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    score: float | None = None

    is_winner: bool = False


class PlayCreate(BaseModel):
    bgg_id: int = Field(gt=0)

    played_at: datetime | None = None

    duration_minutes: int | None = Field(
        default=None,
        ge=0,
    )

    participants: list[
        PlayParticipantCreate
    ] = Field(
        min_length=1,
    )