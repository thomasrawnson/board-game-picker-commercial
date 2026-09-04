from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from api.dependencies import (
    get_game_service,
    get_play_repository,
)
from api.schemas.game import GameCreate
from models.game import Game
from repositories.play_repository import (
    PlayRepository,
)
from services.game_service import GameService


router = APIRouter()


@router.get("/games/{bgg_id}")
def get_game(
    bgg_id: int,
    service: GameService = Depends(
        get_game_service
    ),
):
    game = service.get_game(bgg_id)

    if game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return game

@router.get("/games")
def get_games(
    service: GameService = Depends(
        get_game_service
    ),
):
    return service.get_games()

@router.get(
    "/games/{bgg_id}/plays"
)
def get_game_play_history(
    bgg_id: int,
    limit: int = 10,
    repository: PlayRepository = Depends(
        get_play_repository
    ),
):
    history = (
        repository.get_game_history(
            bgg_id=bgg_id,
            limit=limit,
        )
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return history