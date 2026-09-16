from pydantic import BaseModel, Field


class RankingComparisonCreate(BaseModel):
    winner_bgg_id: int = Field(gt=0)
    loser_bgg_id: int = Field(gt=0)
