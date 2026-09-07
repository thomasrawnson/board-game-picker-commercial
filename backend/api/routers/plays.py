from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from api.dependencies import (
    get_play_repository,
    get_play_service,
)

from repositories.play_repository import (
    PlayRepository,
)
from api.schemas.play import PlayCreate
from services.play_service import PlayService


router = APIRouter()


@router.post(
    "/plays",
    status_code=201,
)
def record_play(
    play_data: PlayCreate,
    service: PlayService = Depends(
        get_play_service
    ),
):
    try:
        play = service.record_play(
            bgg_id=play_data.bgg_id,
            played_at=play_data.played_at,
            duration_minutes=(
                play_data.duration_minutes
            ),
            participants=[
                participant.model_dump()
                for participant
                in play_data.participants
            ],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if play is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return play

@router.get(
    "/players",
)
def get_players(
    repository: PlayRepository = Depends(
        get_play_repository
    ),
):
    return repository.get_players()

@router.get(
    "/players/{player_id}/stats",
)
def get_player_stats(
    player_id: int,
    repository: PlayRepository = Depends(
        get_play_repository
    ),
):
    stats = (
        repository.get_player_stats(
            player_id
        )
    )

    if stats is None:
        raise HTTPException(
            status_code=404,
            detail="Player not found",
        )

    return stats