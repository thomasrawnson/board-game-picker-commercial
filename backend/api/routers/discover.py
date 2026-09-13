import xml.etree.ElementTree as ET

import httpx
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from api.dependencies import (
    get_discover_service,
)
from services.discover_service import (
    DiscoverService,
)


router = APIRouter()


@router.get(
    "/discover"
)
def get_discover_recommendations(
    limit: int = Query(
        10,
        ge=1,
        le=20,
    ),
    service: DiscoverService = Depends(
        get_discover_service
    ),
):
    try:
        return (
            service.get_recommendations(
                limit=limit
            )
        )
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail=(
                "BoardGameGeek took too long "
                "to respond. Please try again."
            ),
        ) from exc
    except (
        httpx.HTTPStatusError,
        RuntimeError,
        ET.ParseError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Recommendations are temporarily "
                "unavailable. Please try again."
            ),
        ) from exc
