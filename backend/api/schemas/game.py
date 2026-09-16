from pydantic import BaseModel, Field


class GameCreate(BaseModel):
    bgg_id: int
    name: str = Field(min_length=1)

    year_published: int | None = None

    min_players: int | None = Field(default=None, ge=1)
    max_players: int | None = Field(default=None, ge=1)

    min_play_time: int | None = Field(default=None, ge=0)
    max_play_time: int | None = Field(default=None, ge=0)
    min_age: int | None = Field(default=None, ge=0)

    complexity: float | None = Field(default=None, ge=0)
    rating: float | None = Field(default=None, ge=0, le=10)

    owned: bool = False
    is_expansion: bool = False

    image_url: str | None = None
    thumbnail_url: str | None = None

    categories: list[str] = Field(default_factory=list)
    mechanics: list[str] = Field(default_factory=list)
