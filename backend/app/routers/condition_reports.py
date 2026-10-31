
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.condition_report import ConditionReport
from app.models.resource import Resource
from app.models.user import User
from app.schemas.condition_report import (
    ConditionReportCreate,
    ConditionReportResponse
)
from app.permissions import require_roles

router = APIRouter(
    prefix="/api/condition-reports",
    tags=["Condition Reports"]
)


# 1. Check-in
# Only the Seeker who owns an approved booking can check in.

@router.post(
    "/{booking_id}/check-in",
    response_model=ConditionReportResponse,
    status_code=status.HTTP_201_CREATED
)
def check_in(
    booking_id: int,
    report_data: ConditionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("seeker"))
):

    # Find booking
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify booking ownership
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check in for your own bookings"
        )

    # Check booking status
    if booking.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved bookings can be checked in"
        )

    # Check booking time
    now = datetime.now(timezone.utc)

    start_time = booking.start_time
    end_time = booking.end_time

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)

    if now < start_time or now > end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in is allowed only during the booking period"
        )

    # Prevent duplicate check-in
    existing_report = db.scalar(
        select(ConditionReport).where(
            ConditionReport.booking_id == booking_id,
            ConditionReport.report_type == "check_in"
        )
    )

    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Check-in has already been completed"
        )

    # Create check-in report
    report = ConditionReport(
        booking_id=booking_id,
        reported_by=current_user.id,
        report_type="check_in",
        condition_status=report_data.condition_status,
        remarks=report_data.remarks
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


# 2. Check-out
# Only the Seeker who checked in can check out.

@router.post(
    "/{booking_id}/check-out",
    response_model=ConditionReportResponse,
    status_code=status.HTTP_201_CREATED
)
def check_out(
    booking_id: int,
    report_data: ConditionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("seeker"))
):

    # Find booking
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Verify booking ownership
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only check out your own bookings"
        )

    # Check booking status
    if booking.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved bookings can be checked out"
        )

    # Check whether check-in is completed
    check_in_report = db.scalar(
        select(ConditionReport).where(
            ConditionReport.booking_id == booking_id,
            ConditionReport.report_type == "check_in"
        )
    )

    if check_in_report is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete check-in before check-out"
        )

    # Prevent duplicate check-out
    existing_report = db.scalar(
        select(ConditionReport).where(
            ConditionReport.booking_id == booking_id,
            ConditionReport.report_type == "check_out"
        )
    )

    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Check-out has already been completed"
        )

    # Create check-out report
    report = ConditionReport(
        booking_id=booking_id,
        reported_by=current_user.id,
        report_type="check_out",
        condition_status=report_data.condition_status,
        remarks=report_data.remarks
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report
# 3. Get condition reports for resources owned by the current Owner

@router.get(
    "/owner",
    response_model=list[ConditionReportResponse]
)
def get_owner_condition_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("owner"))
):
    reports = db.scalars(
        select(ConditionReport)
        .join(Booking, ConditionReport.booking_id == Booking.id)
        .join(Resource, Booking.resource_id == Resource.id)
        .where(Resource.owner_id == current_user.id)
        .order_by(ConditionReport.created_at.desc())
    ).all()

    return reports

# 3. Get condition reports for resources owned by the current Owner

@router.get(
    "/owner",
    response_model=list[ConditionReportResponse]
)
def get_owner_condition_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("owner"))
):
    reports = db.scalars(
        select(ConditionReport)
        .join(Booking, ConditionReport.booking_id == Booking.id)
        .join(Resource, Booking.resource_id == Resource.id)
        .where(Resource.owner_id == current_user.id)
        .order_by(ConditionReport.created_at.desc())
    ).all()

    return reports