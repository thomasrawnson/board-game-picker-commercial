from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from api.schemas.game import GameCreate
from api.schemas.play import PlayCreate
from bgg.client import BGGClient
from database.connection import get_db
from models.game import Game
from repositories.game_repository import GameRepository
from repositories.insights_repository import InsightsRepository
from repositories.play_repository import PlayRepository
from services.collection_service import CollectionService
from services.game_service import GameService
from services.insights_service import InsightsService
from services.picker_service import (
    PickerCriteria,
    PickerService,
)
from services.play_service import PlayService


app = FastAPI(
    title="BoardGamePicker API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_collection_service(
    db: Session = Depends(get_db),
) -> CollectionService:
    return CollectionService(
        bgg_client=BGGClient(),
        repository=GameRepository(db),
    )


@app.post("/collections/{username}/sync")
def sync_collection(
    username: str,
    service: CollectionService = Depends(
        get_collection_service
    ),
):
    games = service.sync_collection(username)

    return {
        "username": username,
        "games_synced": len(games),
    }


def get_game_service(
    db: Session = Depends(get_db),
) -> GameService:
    repository = GameRepository(db)
    return GameService(repository)


@app.get("/games/{bgg_id}")
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


@app.post("/games", status_code=201)
def create_game(
    game_data: GameCreate,
    service: GameService = Depends(
        get_game_service
    ),
):
    game = Game(
        bgg_id=game_data.bgg_id,
        name=game_data.name,
        year_published=game_data.year_published,
        min_players=game_data.min_players,
        max_players=game_data.max_players,
        min_play_time=game_data.min_play_time,
        max_play_time=game_data.max_play_time,
        complexity=game_data.complexity,
        rating=game_data.rating,
        owned=game_data.owned,
        image_url=game_data.image_url,
        thumbnail_url=game_data.thumbnail_url,
        categories=game_data.categories,
        mechanics=game_data.mechanics,
    )

    return service.create_game(game)


@app.get("/games")
def get_games(
    service: GameService = Depends(
        get_game_service
    ),
):
    return service.get_games()


@app.put("/games/{bgg_id}")
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
        year_published=game_data.year_published,
        min_players=game_data.min_players,
        max_players=game_data.max_players,
        min_play_time=game_data.min_play_time,
        max_play_time=game_data.max_play_time,
        complexity=game_data.complexity,
        rating=game_data.rating,
        owned=game_data.owned,
        image_url=game_data.image_url,
        thumbnail_url=game_data.thumbnail_url,
        categories=game_data.categories,
        mechanics=game_data.mechanics,
    )

    updated_game = service.update_game(game)

    if updated_game is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return updated_game


@app.delete("/games/{bgg_id}")
def delete_game(
    bgg_id: int,
    service: GameService = Depends(
        get_game_service
    ),
):
    deleted = service.delete_game(bgg_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return {
        "message": "Game deleted"
    }


def get_picker_play_repository(
    db: Session = Depends(get_db),
) -> PlayRepository:
    return PlayRepository(db)


@app.get("/picker")
def pick_games(
    players: int = Query(..., ge=1),
    max_play_time: int | None = Query(
        None,
        ge=1,
    ),
    max_complexity: float | None = Query(
        None,
        ge=0,
    ),
    preferred_categories: list[str] = Query(
        default=[],
    ),
    preferred_mechanics: list[str] = Query(
        default=[],
    ),
    limit: int = Query(
        10,
        ge=1,
        le=50,
    ),
    game_service: GameService = Depends(
        get_game_service
    ),
    play_repository: PlayRepository = Depends(
        get_picker_play_repository
    ),
):
    games = game_service.get_games()

    picker_service = PickerService()

    play_stats = (
        play_repository.get_game_play_stats()
    )

    criteria = PickerCriteria(
        players=players,
        max_play_time=max_play_time,
        max_complexity=max_complexity,
        preferred_categories=preferred_categories,
        preferred_mechanics=preferred_mechanics,
    )

    matches = picker_service.rank_matches(
        games,
        criteria,
        play_stats=play_stats,
    )

    return [
        {
            "game": match.game,
            "score": match.score,
            "reasons": match.reasons,
        }
        for match in matches[:limit]
    ]


def get_play_service(
    db: Session = Depends(get_db),
) -> PlayService:
    repository = PlayRepository(db)
    return PlayService(repository)


@app.post("/plays", status_code=201)
def record_play(
    play_data: PlayCreate,
    service: PlayService = Depends(
        get_play_service
    ),
):
    play = service.record_play(
        bgg_id=play_data.bgg_id,
        player_count=play_data.player_count,
    )

    if play is None:
        raise HTTPException(
            status_code=404,
            detail="Game not found",
        )

    return play


def get_insights_service(
    db: Session = Depends(get_db),
) -> InsightsService:
    repository = InsightsRepository(db)
    return InsightsService(repository)


@app.get("/insights")
def get_collection_insights(
    service: InsightsService = Depends(
        get_insights_service
    ),
):
    return service.get_collection_insights()