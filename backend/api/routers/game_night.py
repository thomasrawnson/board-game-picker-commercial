from fastapi import APIRouter, Depends, HTTPException, Query

from api.current_user import get_current_user
from api.dependencies import get_game_service, get_play_repository
from database.models import User
from repositories.play_repository import PlayRepository
from services.entitlements import Feature, can_use
from services.game_night_service import GameNightService
from services.game_service import GameService


router = APIRouter(prefix="/game-night", tags=["game-night"])


@router.get("/recommendations")
def get_game_night_recommendations(
    player_ids: list[int] = Query(..., min_length=1),
    max_play_time: int | None = Query(None, ge=1),
    limit: int = Query(5, ge=3, le=5),
    current_user: User = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
    play_repository: PlayRepository = Depends(get_play_repository),
):
    if not can_use(current_user, Feature.GAME_NIGHT_BASIC):
        raise HTTPException(status_code=403, detail="Game Night is unavailable.")

    if len(player_ids) != len(set(player_ids)):
        raise HTTPException(status_code=400, detail="Player IDs must be unique.")

    known_player_ids = {
        player["id"] for player in play_repository.get_players()
    }
    if any(player_id not in known_player_ids for player_id in player_ids):
        raise HTTPException(status_code=400, detail="Unknown player.")

    matches = GameNightService().recommend(
        game_service.get_games(),
        player_ids,
        max_play_time,
        play_stats=play_repository.get_game_play_stats(),
        group_play_stats=play_repository.get_group_game_play_stats(player_ids),
        limit=limit,
    )

    return [
        {
            "game": match.game,
            "score": match.score,
            "reasons": [*match.reasons, "From your collection"],
        }
        for match in matches
    ]
