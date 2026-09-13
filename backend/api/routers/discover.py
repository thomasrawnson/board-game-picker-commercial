from fastapi import (
    APIRouter,
    Depends,
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
    return (
        service.get_recommendations(
            limit=limit
        )
    )