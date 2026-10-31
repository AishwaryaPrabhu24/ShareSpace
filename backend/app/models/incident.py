
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Incident(Base):

    __tablename__ = "incidents"

    # Primary key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Related booking (optional for general incidents)
    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("bookings.id"),
        nullable=True
    )

    # User reporting the incident
    reported_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # Incident title
    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    # Detailed incident description
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Incident severity: low, medium, high, critical
    severity: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False
    )

    # Incident status: open, investigating, resolved, rejected
    status: Mapped[str] = mapped_column(
        String(30),
        default="open",
        nullable=False
    )

    # Resolution remarks provided by Admin or Owner
    resolution_remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Incident creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
