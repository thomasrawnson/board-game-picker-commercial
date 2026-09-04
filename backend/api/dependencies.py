from fastapi import Depends
from sqlalchemy.orm import Session

from api.current_user import get_current_user
from bgg.client import BGGClient
from database.connection import get_db
from database.models import User
from repositories.game_repository import GameRepository
from repositories.insights_repository import InsightsRepository
from repositories.play_repository import PlayRepository
from services.bgstats_play_import_service import (
    BGStatsPlayImportService,
)
from services.collection_service import CollectionService
from services.game_service import GameService
from services.insights_service import InsightsService
from services.play_service import PlayService


def get_game_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> GameService:
    repository = GameRepository(db)

    return GameService(
        repository,
        user_id=current_user.id,
    )


def get_collection_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> CollectionService:
    return CollectionService(
        bgg_client=BGGClient(),
        repository=GameRepository(db),
        user_id=current_user.id,
    )


def get_play_repository(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> PlayRepository:
    return PlayRepository(
        db,
        user_id=current_user.id,
    )


def get_play_service(
    repository: PlayRepository = Depends(
        get_play_repository
    ),
) -> PlayService:
    return PlayService(repository)


def get_insights_service(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
) -> InsightsService:
    repository = InsightsRepository(
        db,
        user_id=current_user.id,
    )

    return InsightsService(repository)


def get_bgstats_play_import_service(
    repository: PlayRepository = Depends(
        get_play_repository
    ),
) -> BGStatsPlayImportService:
    return BGStatsPlayImportService(
        repository
    )