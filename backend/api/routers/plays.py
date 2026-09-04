from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from api.dependencies import (
    get_play_service,
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

    if play is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return play