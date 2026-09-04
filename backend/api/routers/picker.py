from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from api.dependencies import (
    get_game_service,
    get_play_repository,
)
from repositories.play_repository import (
    PlayRepository,
)
from services.game_service import GameService
from services.picker_service import (
    PickerCriteria,
    PickerService,
)


router = APIRouter()


@router.get("/picker")
def pick_games(
    players: int = Query(
        ...,
        ge=1,
    ),
    max_play_time: int | None = Query(
        None,
        ge=1,
    ),
    max_complexity: float | None = Query(
        None,
        ge=0,
        le=5,
    ),
    preferred_categories: list[str] = Query(
        default=[],
    ),
    preferred_mechanics: list[str] = Query(
        default=[],
    ),
    mode: str = Query(
        "best_match",
        pattern=(
            "^(best_match|different|surprise)$"
        ),
    ),
    limit: int = Query(
        20,
        ge=1,
        le=50,
    ),
    game_service: GameService = Depends(
        get_game_service
    ),
    play_repository: PlayRepository = Depends(
        get_play_repository
    ),
):
    games = game_service.get_games()

    picker_service = PickerService()

    play_stats = (
        play_repository
        .get_game_play_stats()
    )

    criteria = PickerCriteria(
        players=players,
        max_play_time=max_play_time,
        max_complexity=max_complexity,
        preferred_categories=(
            preferred_categories
        ),
        preferred_mechanics=(
            preferred_mechanics
        ),
        mode=mode,
    )

    matches = (
        picker_service.rank_matches(
            games,
            criteria,
            play_stats=play_stats,
        )
    )

    return [
        {
            "game": match.game,
            "score": match.score,
            "reasons": match.reasons,
        }
        for match
        in matches[:limit]
    ]