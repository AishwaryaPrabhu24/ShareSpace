from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.resource import Resource
from app.models.booking import Booking


def get_analytics_overview(db: Session):
    total_resources = db.query(func.count(Resource.id)).scalar() or 0

    available_resources = (
        db.query(func.count(Resource.id))
        .filter(
            Resource.is_available == True,
            Resource.quantity > 0
        )
        .scalar() or 0
    )

    total_bookings = db.query(func.count(Booking.id)).scalar() or 0

    def count_status(status):
        return (
            db.query(func.count(Booking.id))
            .filter(Booking.status == status)
            .scalar() or 0
        )

    return {
        "total_resources": total_resources,
        "available_resources": available_resources,
        "unavailable_resources": total_resources - available_resources,
        "total_bookings": total_bookings,
        "approved_bookings": count_status("approved"),
        "pending_bookings": count_status("pending"),
        "rejected_bookings": count_status("rejected"),
        "cancelled_bookings": count_status("cancelled"),
    }


def get_resource_utilization(db: Session, start_date=None, end_date=None):
    resources = db.query(Resource).all()

    now = datetime.now(timezone.utc)

    if start_date is None:
        start_date = now - timedelta(days=30)

    if end_date is None:
        end_date = now

    results = []

    for resource in resources:
        all_bookings = db.query(Booking).filter(
            Booking.resource_id == resource.id,
            Booking.start_time < end_date,
            Booking.end_time > start_date
        ).all()

        approved_bookings = [
            booking for booking in all_bookings
            if booking.status == "approved"
        ]

        total_usage_seconds = 0

        for booking in approved_bookings:
            booking_start = booking.start_time
            booking_end = booking.end_time

            if booking_start.tzinfo is None:
                booking_start = booking_start.replace(tzinfo=timezone.utc)

            if booking_end.tzinfo is None:
                booking_end = booking_end.replace(tzinfo=timezone.utc)

            actual_start = max(booking_start, start_date)
            actual_end = min(booking_end, end_date)

            if actual_end > actual_start:
                total_usage_seconds += (
                    actual_end - actual_start
                ).total_seconds()

        total_usage_hours = total_usage_seconds / 3600

        period_hours = (
            end_date - start_date
        ).total_seconds() / 3600

        available_capacity_hours = period_hours * resource.quantity

        utilization_percentage = (
            total_usage_hours / available_capacity_hours * 100
            if available_capacity_hours > 0 else 0
        )

        results.append({
            "resource_id": resource.id,
            "resource_name": resource.name,
            "category": resource.category,
            "quantity": resource.quantity,
            "total_bookings": len(all_bookings),
            "approved_bookings": len(approved_bookings),
            "total_usage_hours": round(total_usage_hours, 2),
            "utilization_percentage": round(
                min(utilization_percentage, 100), 2
            )
        })

    return results

    
def get_booking_trends(db: Session, start_date, end_date):
    bookings = db.query(Booking).filter(
        Booking.created_at >= start_date,
        Booking.created_at < end_date + timedelta(days=1)
    ).all()

    daily_data = {}

    current_date = start_date.date()
    final_date = end_date.date()

    while current_date <= final_date:
        daily_data[current_date] = {
            "booking_date": current_date,
            "total_bookings": 0,
            "approved_bookings": 0,
            "rejected_bookings": 0,
            "cancelled_bookings": 0
        }
        current_date += timedelta(days=1)

    for booking in bookings:
        booking_date = booking.created_at.date()

        if booking_date not in daily_data:
            continue

        daily_data[booking_date]["total_bookings"] += 1

        if booking.status in ["approved", "rejected", "cancelled"]:
            daily_data[booking_date][f"{booking.status}_bookings"] += 1

    return list(daily_data.values())