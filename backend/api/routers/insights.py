from fastapi import (
    APIRouter,
    Depends,
)

from api.dependencies import (
    get_insights_service,
)
from services.insights_service import (
    InsightsService,
)


router = APIRouter()


@router.get("/insights")
def get_collection_insights(
    service: InsightsService = Depends(
        get_insights_service
    ),
):
    return (
        service.get_collection_insights()
    )