from typing import Literal

from pydantic import BaseModel, Field


PickerEventType = Literal[
    "try_another",
    "view_game",
    "start_over",
]


class PickerEventCreate(BaseModel):
    session_id: str = Field(
        min_length=36,
        max_length=36,
    )

    event_type: PickerEventType

    bgg_id: int | None = Field(
        default=None,
        gt=0,
    )

    position: int | None = Field(
        default=None,
        ge=0,
    )
