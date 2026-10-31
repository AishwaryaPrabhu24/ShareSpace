from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.permissions import require_admin

from app.schemas.analytics import (
    AnalyticsOverview,
    ResourceUtilizationResponse,
    BookingTrendResponse
)

from app.services.analytics_service import (
    get_analytics_overview,
    get_resource_utilization,
    get_booking_trends
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


def get_date_range(start_date=None, end_date=None):
    today = datetime.now(timezone.utc).date()

    if end_date is None:
        end_date = today

    if start_date is None:
        start_date = end_date - timedelta(days=29)

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be later than end date."
        )

    start_datetime = datetime.combine(
        start_date,
        datetime.min.time(),
        tzinfo=timezone.utc
    )

    end_datetime = datetime.combine(
        end_date + timedelta(days=1),
        datetime.min.time(),
        tzinfo=timezone.utc
    )

    return start_datetime, end_datetime


@router.get(
    "/overview",
    response_model=AnalyticsOverview
)
def analytics_overview(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return get_analytics_overview(db)


@router.get(
    "/resource-utilization",
    response_model=list[ResourceUtilizationResponse]
)
def resource_utilization(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    start_datetime, end_datetime = get_date_range(
        start_date,
        end_date
    )

    return get_resource_utilization(
        db,
        start_datetime,
        end_datetime
    )


@router.get(
    "/booking-trends",
    response_model=list[BookingTrendResponse]
)
def booking_trends(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    start_datetime, end_datetime = get_date_range(
        start_date,
        end_date
    )

    # The service adds one day to end_date internally.
    # Pass midnight at the beginning of the selected final day.
    trend_end_datetime = end_datetime - timedelta(days=1)

    return get_booking_trends(
        db,
        start_datetime,
        trend_end_datetime
    )