
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.resource import Resource
from app.models.user import User
from app.models.waiting_list import WaitingList
from app.models.eligibility import (
    ResourceEligibility,
    UserQualification
)
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingDecision
)
from app.permissions import require_roles
from app.services.notification_service import create_notification
from app.services.audit_log_service import create_audit_log


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)


# FAIR USAGE CONFIGURATION

MAX_ACTIVE_BOOKINGS = 3
MAX_WEEKLY_HOURS = 10


# -------------------------------------------------
# AUTOMATIC WAITING LIST PROMOTION
# -------------------------------------------------

def promote_waiting_list(
    db: Session,
    cancelled_booking: Booking
):
    """
    Find the next eligible seeker waiting for the
    same resource and exact time slot.

    Recheck capacity, eligibility and fair-use limits
    before creating a booking.

    Generate notifications and audit logs after promotion.
    """

    waiting_entries = db.scalars(
        select(WaitingList)
        .where(
            WaitingList.resource_id == cancelled_booking.resource_id,
            WaitingList.start_time == cancelled_booking.start_time,
            WaitingList.end_time == cancelled_booking.end_time,
            WaitingList.status == "waiting"
        )
        .order_by(
            WaitingList.position.asc(),
            WaitingList.created_at.asc()
        )
    ).all()

    if not waiting_entries:
        return

    resource = db.get(
        Resource,
        cancelled_booking.resource_id
    )

    if resource is None or not resource.is_available:
        return

    overlapping_count = db.scalar(
        select(func.count(Booking.id)).where(
            Booking.resource_id == resource.id,
            Booking.status.in_(["pending", "approved"]),
            Booking.start_time < cancelled_booking.end_time,
            Booking.end_time > cancelled_booking.start_time
        )
    ) or 0

    if overlapping_count >= resource.quantity:
        return

    requirements = db.scalars(
        select(ResourceEligibility).where(
            ResourceEligibility.resource_id == resource.id
        )
    ).all()

    for waiting_entry in waiting_entries:

        qualifications = db.scalars(
            select(UserQualification).where(
                UserQualification.user_id == waiting_entry.user_id,
                UserQualification.is_verified.is_(True)
            )
        ).all()

        verified_qualifications = {
            (
                qualification.qualification_type.casefold(),
                qualification.qualification_value.casefold()
            )
            for qualification in qualifications
        }

        eligible = all(
            (
                requirement.criterion_type.casefold(),
                requirement.criterion_value.casefold()
            ) in verified_qualifications
            for requirement in requirements
        )

        if not eligible:
            waiting_entry.status = "skipped"
            continue

        current_time = datetime.now(
            waiting_entry.start_time.tzinfo
        )

        active_booking_count = db.scalar(
            select(func.count(Booking.id)).where(
                Booking.user_id == waiting_entry.user_id,
                Booking.status.in_(["pending", "approved"]),
                Booking.end_time > current_time
            )
        ) or 0

        if active_booking_count >= MAX_ACTIVE_BOOKINGS:
            waiting_entry.status = "skipped"
            continue

        week_start = (
            waiting_entry.start_time.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )
            - timedelta(
                days=waiting_entry.start_time.weekday()
            )
        )

        week_end = week_start + timedelta(days=7)

        weekly_bookings = db.scalars(
            select(Booking).where(
                Booking.user_id == waiting_entry.user_id,
                Booking.status.in_(["pending", "approved"]),
                Booking.start_time < week_end,
                Booking.end_time > week_start
            )
        ).all()

        booked_hours = 0

        for existing_booking in weekly_bookings:

            overlap_start = max(
                existing_booking.start_time,
                week_start
            )

            overlap_end = min(
                existing_booking.end_time,
                week_end
            )

            booked_hours += (
                overlap_end - overlap_start
            ).total_seconds() / 3600

        requested_start = max(
            waiting_entry.start_time,
            week_start
        )

        requested_end = min(
            waiting_entry.end_time,
            week_end
        )

        requested_hours = (
            requested_end - requested_start
        ).total_seconds() / 3600

        if booked_hours + requested_hours > MAX_WEEKLY_HOURS:
            waiting_entry.status = "skipped"
            continue

        initial_status = (
            "pending"
            if resource.requires_approval
            else "approved"
        )

        promoted_booking = Booking(
            user_id=waiting_entry.user_id,
            resource_id=resource.id,
            start_time=waiting_entry.start_time,
            end_time=waiting_entry.end_time,
            purpose=waiting_entry.purpose,
            status=initial_status
        )

        db.add(promoted_booking)
        db.flush()

        # AUDIT LOG: WAITING-LIST PROMOTION

        create_audit_log(
            db=db,
            user_id=waiting_entry.user_id,
            user_role="seeker",
            action="BOOKING_CREATED",
            entity_type="Booking",
            entity_id=promoted_booking.id,
            description=(
                f"Booking for resource '{resource.name}' "
                f"was created through waiting-list promotion."
            ),
            details={
                "resource_id": resource.id,
                "resource_name": resource.name,
                "booking_status": initial_status,
                "source": "waiting_list",
                "waiting_list_id": waiting_entry.id
            }
        )

        waiting_entry.status = "promoted"

        if initial_status == "pending":

            create_notification(
                db=db,
                user_id=waiting_entry.user_id,
                title="Waiting List Promotion",
                message=(
                    f"You have been promoted from the waiting list "
                    f"for {resource.name}. Your booking is waiting "
                    f"for owner approval."
                ),
                notification_type="waiting_list_promoted",
                related_booking_id=promoted_booking.id
            )

            create_notification(
                db=db,
                user_id=resource.owner_id,
                title="Promoted Booking Requires Approval",
                message=(
                    f"A waiting-list seeker has been promoted for "
                    f"{resource.name}. Please review the booking."
                ),
                notification_type="booking_request",
                related_booking_id=promoted_booking.id
            )

        else:

            create_notification(
                db=db,
                user_id=waiting_entry.user_id,
                title="Waiting List Promotion Successful",
                message=(
                    f"You have been promoted from the waiting list "
                    f"and your booking for {resource.name} is confirmed."
                ),
                notification_type="waiting_list_promoted",
                related_booking_id=promoted_booking.id
            )

        # Commit booking, audit log, waiting-list update
        # and notifications together.

        db.commit()

        return

    db.commit()


# -------------------------------------------------
# 1. CREATE A BOOKING REQUEST
# Only Seekers can request resources.
# -------------------------------------------------

@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("seeker"))
):

    resource = db.get(Resource, booking_data.resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    if not resource.is_available or resource.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This resource is currently unavailable"
        )

    # FAIR USAGE MANAGEMENT

    current_time = datetime.now(
        booking_data.start_time.tzinfo
    )

    active_bookings_query = select(
        func.count(Booking.id)
    ).where(
        Booking.user_id == current_user.id,
        Booking.status.in_(["pending", "approved"]),
        Booking.end_time > current_time
    )

    active_booking_count = db.scalar(
        active_bookings_query
    ) or 0

    if active_booking_count >= MAX_ACTIVE_BOOKINGS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You have reached the maximum limit of "
                f"{MAX_ACTIVE_BOOKINGS} active bookings."
            )
        )

    # WEEKLY BOOKING HOURS

    week_start = (
        booking_data.start_time.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )
        - timedelta(
            days=booking_data.start_time.weekday()
        )
    )

    week_end = week_start + timedelta(days=7)

    weekly_bookings_query = select(Booking).where(
        Booking.user_id == current_user.id,
        Booking.status.in_(["pending", "approved"]),
        Booking.start_time < week_end,
        Booking.end_time > week_start
    )

    weekly_bookings = db.scalars(
        weekly_bookings_query
    ).all()

    booked_hours = 0

    for existing_booking in weekly_bookings:

        overlap_start = max(
            existing_booking.start_time,
            week_start
        )

        overlap_end = min(
            existing_booking.end_time,
            week_end
        )

        booked_hours += (
            overlap_end - overlap_start
        ).total_seconds() / 3600

    requested_start = max(
        booking_data.start_time,
        week_start
    )

    requested_end = min(
        booking_data.end_time,
        week_end
    )

    requested_hours = (
        requested_end - requested_start
    ).total_seconds() / 3600

    if booked_hours + requested_hours > MAX_WEEKLY_HOURS:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": (
                    "You have exceeded the weekly booking limit."
                ),
                "weekly_limit_hours": MAX_WEEKLY_HOURS,
                "already_booked_hours": round(
                    booked_hours, 2
                ),
                "requested_hours": round(
                    requested_hours, 2
                )
            }
        )

    # RESOURCE ELIGIBILITY CHECK

    requirements = db.scalars(
        select(ResourceEligibility).where(
            ResourceEligibility.resource_id == resource.id
        )
    ).all()

    if requirements:

        qualifications = db.scalars(
            select(UserQualification).where(
                UserQualification.user_id == current_user.id,
                UserQualification.is_verified.is_(True)
            )
        ).all()

        verified_qualifications = {
            (
                qualification.qualification_type.casefold(),
                qualification.qualification_value.casefold()
            )
            for qualification in qualifications
        }

        missing_requirements = []

        for requirement in requirements:

            required_qualification = (
                requirement.criterion_type.casefold(),
                requirement.criterion_value.casefold()
            )

            if required_qualification not in verified_qualifications:

                missing_requirements.append(
                    f"{requirement.criterion_type}: "
                    f"{requirement.criterion_value}"
                )

        if missing_requirements:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": (
                        "You are not eligible to book this resource."
                    ),
                    "missing_requirements": missing_requirements
                }
            )

    # RESOURCE CAPACITY CHECK

    overlapping_query = select(
        func.count(Booking.id)
    ).where(
        Booking.resource_id == resource.id,
        Booking.status.in_(["pending", "approved"]),
        Booking.start_time < booking_data.end_time,
        Booking.end_time > booking_data.start_time
    )

    overlapping_count = db.scalar(
        overlapping_query
    ) or 0

    if overlapping_count >= resource.quantity:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Resource is already booked during this time"
            )
        )

    initial_status = (
        "pending"
        if resource.requires_approval
        else "approved"
    )

    new_booking = Booking(
        user_id=current_user.id,
        resource_id=resource.id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        purpose=booking_data.purpose,
        status=initial_status
    )

    db.add(new_booking)
    db.flush()

    # AUDIT LOG: BOOKING CREATED

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="BOOKING_CREATED",
        entity_type="Booking",
        entity_id=new_booking.id,
        description=(
            f"Booking for resource '{resource.name}' was created."
        ),
        details={
            "resource_id": resource.id,
            "resource_name": resource.name,
            "booking_status": initial_status,
            "start_time": booking_data.start_time.isoformat(),
            "end_time": booking_data.end_time.isoformat(),
            "purpose": booking_data.purpose
        }
    )

    # CREATE NOTIFICATION

    if initial_status == "pending":

        create_notification(
            db=db,
            user_id=resource.owner_id,
            title="New Booking Request",
            message=(
                f"{current_user.full_name} has requested "
                f"to book {resource.name}. Please review "
                f"the booking request."
            ),
            notification_type="booking_request",
            related_booking_id=new_booking.id
        )

    else:

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Booking Confirmed",
            message=(
                f"Your booking for {resource.name} "
                f"has been confirmed automatically."
            ),
            notification_type="booking_confirmed",
            related_booking_id=new_booking.id
        )

    # Booking, audit log and notification commit together.

    db.commit()
    db.refresh(new_booking)

    return new_booking


# -------------------------------------------------
# 2. VIEW BOOKINGS BASED ON USER ROLE
# Seeker: Own bookings
# Owner: Bookings for their resources
# Admin: All bookings
# -------------------------------------------------

@router.get(
    "/my",
    response_model=list[BookingResponse]
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    statement = (
        select(Booking)
        .join(
            Resource,
            Resource.id == Booking.resource_id
        )
        .order_by(
            Booking.created_at.desc()
        )
    )

    if current_user.role == "seeker":

        statement = statement.where(
            Booking.user_id == current_user.id
        )

    elif current_user.role == "owner":

        statement = statement.where(
            Resource.owner_id == current_user.id
        )

    elif current_user.role != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to view bookings"
            )
        )

    bookings = db.scalars(statement).all()

    return bookings


# -------------------------------------------------
# 3. CANCEL A BOOKING
# Only the Seeker who created the booking can cancel it.
# -------------------------------------------------

@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("seeker"))
):

    booking = db.get(
        Booking,
        booking_id
    )

    if booking is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    if booking.user_id != current_user.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only cancel your own bookings"
            )
        )

    if booking.status not in ["pending", "approved"]:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking cannot be cancelled"
        )

    resource = db.get(
        Resource,
        booking.resource_id
    )

    if resource is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resource not found"
        )

    booking.status = "cancelled"

    # AUDIT LOG: BOOKING CANCELLED

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="BOOKING_CANCELLED",
        entity_type="Booking",
        entity_id=booking.id,
        description=(
            f"Booking for resource '{resource.name}' "
            f"was cancelled by the seeker."
        ),
        details={
            "resource_id": resource.id,
            "resource_name": resource.name,
            "previous_status": "pending or approved",
            "new_status": "cancelled"
        }
    )

    # NOTIFY RESOURCE OWNER

    create_notification(
        db=db,
        user_id=resource.owner_id,
        title="Booking Cancelled",
        message=(
            f"A booking for {resource.name} "
            f"has been cancelled by the seeker."
        ),
        notification_type="booking_cancelled",
        related_booking_id=booking.id
    )

    # Commit cancellation, audit log and notification together.

    db.commit()
    db.refresh(booking)

    # Automatically consider the next waiting seeker.

    promote_waiting_list(db, booking)

    db.refresh(booking)

    return booking


# -------------------------------------------------
# 4. APPROVE OR REJECT A BOOKING
# Admin can manage all bookings.
# Owner can manage bookings for their own resources.
# -------------------------------------------------

@router.put(
    "/{booking_id}/decision",
    response_model=BookingResponse
)
def decide_booking(
    booking_id: int,
    decision_data: BookingDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner")
    )
):

    booking = db.get(
        Booking,
        booking_id
    )

    if booking is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    resource = db.get(
        Resource,
        booking.resource_id
    )

    if resource is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated resource not found"
        )

    if (
        current_user.role != "admin"
        and resource.owner_id != current_user.id
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only manage bookings for your own resources"
            )
        )

    if booking.status != "pending":

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This booking has already been processed"
            )
        )

    # RECHECK RESOURCE AVAILABILITY BEFORE APPROVAL

    if decision_data.status == "approved":

        if not resource.is_available or resource.quantity < 1:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This resource is currently unavailable"
            )

        overlapping_query = select(
            func.count(Booking.id)
        ).where(
            Booking.resource_id == resource.id,
            Booking.id != booking.id,
            Booking.status.in_(["pending", "approved"]),
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time
        )

        overlapping_count = db.scalar(
            overlapping_query
        ) or 0

        if overlapping_count >= resource.quantity:

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Cannot approve this booking. "
                    "Resource capacity is already occupied "
                    "during this time."
                )
            )

    # UPDATE BOOKING DECISION

    previous_status = booking.status

    booking.status = decision_data.status

    booking.decision_remarks = (
        decision_data.decision_remarks
    )

    # AUDIT LOG: BOOKING APPROVED OR REJECTED

    audit_action = (
        "BOOKING_APPROVED"
        if decision_data.status == "approved"
        else "BOOKING_REJECTED"
    )

    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action=audit_action,
        entity_type="Booking",
        entity_id=booking.id,
        description=(
            f"Booking for resource '{resource.name}' "
            f"was {decision_data.status} by {current_user.role}."
        ),
        details={
            "resource_id": resource.id,
            "resource_name": resource.name,
            "seeker_id": booking.user_id,
            "previous_status": previous_status,
            "new_status": decision_data.status,
            "decision_remarks": decision_data.decision_remarks
        }
    )

    # NOTIFY SEEKER ABOUT BOOKING DECISION

    if decision_data.status == "approved":

        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Booking Approved",
            message=(
                f"Your booking for {resource.name} "
                f"has been approved."
            ),
            notification_type="booking_approved",
            related_booking_id=booking.id
        )

    else:

        rejection_message = (
            f"Your booking request for {resource.name} "
            f"has been rejected."
        )

        if decision_data.decision_remarks:
            rejection_message += (
                f" Remarks: {decision_data.decision_remarks}"
            )

        create_notification(
            db=db,
            user_id=booking.user_id,
            title="Booking Rejected",
            message=rejection_message,
            notification_type="booking_rejected",
            related_booking_id=booking.id
        )

    # Commit booking decision, audit log and notification together.

    db.commit()
    db.refresh(booking)

    return booking
