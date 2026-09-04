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
    if not file.filename.lower().endswith(
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
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read JSON file"
            ),
        )

    result = service.import_plays(
        json_text
    )

    return {
        "imported": result.imported,
        "skipped_existing": (
            result.skipped_existing
        ),
        "skipped_missing_game": (
            result.skipped_missing_game
        ),
    }