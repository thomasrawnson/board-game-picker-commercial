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
from repositories.play_repository import (
    PlayRepository,
)
from services.game_service import (
    GameService,
)
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
    player_ids: list[int] = Query(
        default=[],
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
    if (
        len(player_ids)
        != len(set(player_ids))
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Player IDs must be unique."
            ),
        )

    if (
        len(player_ids)
        > players
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Selected players cannot "
                "exceed player count."
            ),
        )

    known_player_ids = {
        player["id"]
        for player
        in play_repository.get_players()
    }

    if any(
        player_id
        not in known_player_ids
        for player_id
        in player_ids
    ):
        raise HTTPException(
            status_code=400,
            detail="Unknown player.",
        )

    games = (
        game_service.get_games()
    )

    picker_service = (
        PickerService()
    )

    play_stats = (
        play_repository
        .get_game_play_stats()
    )

    group_play_stats = (
        play_repository
        .get_group_game_play_stats(
            player_ids
        )
        if player_ids
        else {}
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
        player_ids=player_ids,
        mode=mode,
    )

    matches = (
        picker_service.rank_matches(
            games,
            criteria,
            play_stats=play_stats,
            group_play_stats=(
                group_play_stats
            ),
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