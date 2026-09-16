from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from api.dependencies import get_ranking_service
from api.schemas.ranking import (
    RankingComparisonCreate,
)
from services.ranking_service import RankingService


router = APIRouter()


@router.get("/rankings/matchup")
def get_ranking_matchup(
    exclude_bgg_ids: list[int] = Query(
        default=[],
    ),
    played_only: bool = Query(default=True),
    service: RankingService = Depends(
        get_ranking_service
    ),
):
    return {
        "games": service.get_matchup(
            exclude_bgg_ids,
            played_only,
        )
    }


@router.get("/rankings")
def get_rankings(
    played_only: bool = Query(default=True),
    summary_limit: int = Query(default=20),
    service: RankingService = Depends(
        get_ranking_service
    ),
):
    if summary_limit not in {10, 20, 50, 100}:
        raise HTTPException(
            status_code=422,
            detail=(
                "summary_limit must be one of "
                "10, 20, 50 or 100"
            ),
        )

    return service.get_rankings(
        played_only,
        summary_limit,
    )


@router.post(
    "/rankings/comparisons",
    status_code=201,
)
def record_ranking_comparison(
    comparison: RankingComparisonCreate,
    service: RankingService = Depends(
        get_ranking_service
    ),
):
    try:
        return service.choose(
            comparison.winner_bgg_id,
            comparison.loser_bgg_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post(
    "/rankings/games/{bgg_id}/unplayed",
    status_code=204,
)
def mark_ranking_game_unplayed(
    bgg_id: int,
    service: RankingService = Depends(
        get_ranking_service
    ),
):
    if not service.mark_unplayed(bgg_id):
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )


@router.delete(
    "/rankings/games/{bgg_id}/unplayed",
    status_code=204,
)
def restore_ranking_game(
    bgg_id: int,
    service: RankingService = Depends(
        get_ranking_service
    ),
):
    if not service.restore_game(bgg_id):
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )
