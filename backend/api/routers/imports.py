import json

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from api.dependencies import (
    get_bgstats_play_import_service,
)
from services.bgstats_play_import_service import (
    BGStatsPlayImportService,
)


router = APIRouter()


@router.post(
    "/imports/bgstats/plays"
)
async def import_bgstats_plays(
    file: UploadFile = File(...),
    service: BGStatsPlayImportService = Depends(
        get_bgstats_play_import_service
    ),
):
    filename = file.filename or ""

    if not filename.lower().endswith(
        ".json"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "BG Stats export must be "
                "a JSON file"
            ),
        )

    contents = await file.read()

    try:
        json_text = contents.decode(
            "utf-8"
        )
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read JSON file"
            ),
        ) from exc

    try:
        result = service.import_plays(
            json_text
        )
    except (
        json.JSONDecodeError,
        KeyError,
        TypeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "That file is not a valid "
                "BG Stats JSON export"
            ),
        ) from exc

    return {
        "imported": result.imported,
        "skipped_existing": (
            result.skipped_existing
        ),
        "skipped_missing_game": (
            result.skipped_missing_game
        ),
    }
