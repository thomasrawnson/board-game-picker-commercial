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


@router.post(
    "/games",
    status_code=201,
)
def create_game(
    game_data: GameCreate,
    service: GameService = Depends(
        get_game_service
    ),
):
    game = Game(
        bgg_id=game_data.bgg_id,
        name=game_data.name,
        year_published=(
            game_data.year_published
        ),
        min_players=game_data.min_players,
        max_players=game_data.max_players,
        min_play_time=(
            game_data.min_play_time
        ),
        max_play_time=(
            game_data.max_play_time
        ),
        complexity=game_data.complexity,
        rating=game_data.rating,
        owned=game_data.owned,
        image_url=game_data.image_url,
        thumbnail_url=(
            game_data.thumbnail_url
        ),
        categories=game_data.categories,
        mechanics=game_data.mechanics,
    )

    return service.create_game(game)


@router.get("/games")
def get_games(
    service: GameService = Depends(
        get_game_service
    ),
):
    return service.get_games()


@router.put("/games/{bgg_id}")
def update_game(
    bgg_id: int,
    game_data: GameCreate,
    service: GameService = Depends(
        get_game_service
    ),
):
    if bgg_id != game_data.bgg_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "BGG ID in URL does not "
                "match request body"
            ),
        )

    game = Game(
        bgg_id=game_data.bgg_id,
        name=game_data.name,
        year_published=(
            game_data.year_published
        ),
        min_players=game_data.min_players,
        max_players=game_data.max_players,
        min_play_time=(
            game_data.min_play_time
        ),
        max_play_time=(
            game_data.max_play_time
        ),
        complexity=game_data.complexity,
        rating=game_data.rating,
        owned=game_data.owned,
        image_url=game_data.image_url,
        thumbnail_url=(
            game_data.thumbnail_url
        ),
        categories=game_data.categories,
        mechanics=game_data.mechanics,
    )

    updated_game = (
        service.update_game(game)
    )

    if updated_game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return updated_game


@router.delete("/games/{bgg_id}")
def delete_game(
    bgg_id: int,
    service: GameService = Depends(
        get_game_service
    ),
):
    deleted = (
        service.delete_game(bgg_id)
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return {
        "message": "Game deleted"
    }


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