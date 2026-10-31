
from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    related_booking_id: int | None = None
):
    notification = Notification(
        user_id=user_id,
        related_booking_id=related_booking_id,
        title=title,
        message=message,
        notification_type=notification_type
    )

    db.add(notification)
    db.flush()

    return notification
