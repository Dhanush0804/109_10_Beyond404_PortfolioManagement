from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.models.responses import HealthResponse
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Returns current service health status and timestamp."
)
async def get_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
