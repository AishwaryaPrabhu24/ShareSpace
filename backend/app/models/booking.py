
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Booking(Base):

    __tablename__ = "bookings"

    # Primary key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # User requesting the resource
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # Requested resource
    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False
    )

    # Booking schedule
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    # Booking status
    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False
    )

    # Purpose of booking
    purpose: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Owner's decision remarks
    decision_remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Booking creation time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
