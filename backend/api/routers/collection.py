from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from api.dependencies import (
    get_collection_service,
    get_game_service,
    get_play_repository,
)
from repositories.play_repository import (
    PlayRepository,
)
from services.collection_service import (
    CollectionService,
)
from services.game_service import GameService
from sqlalchemy.orm import Session

from api.current_user import (
    get_current_user,
)
from api.schemas.collection import (
    CollectionSyncRequest,
)
from database.connection import get_db
from database.models import User

router = APIRouter()


@router.post(
    "/collection/sync"
)
def sync_collection(
    request: CollectionSyncRequest,
    service: CollectionService = Depends(
        get_collection_service
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    username = (
        request.username
        .strip()
    )

    games = service.sync_collection(
        username
    )

    current_user.bgg_username = (
        username
    )

    db.commit()

    return {
        "username": username,
        "games_synced": len(games),
    }


@router.get("/collection/stats")
def get_collection_stats(
    repository: PlayRepository = Depends(
        get_play_repository
    ),
):
    return (
        repository.get_collection_stats()
    )


@router.delete(
    "/collection/{bgg_id}"
)
def remove_from_collection(
    bgg_id: int,
    service: GameService = Depends(
        get_game_service
    ),
):
    removed = (
        service.remove_from_collection(
            bgg_id
        )
    )

    if not removed:
        raise HTTPException(
            status_code=404,
            detail=(
                "Game not found in collection"
            ),
        )

    return {
        "message": (
            "Game removed from collection"
        )
    }