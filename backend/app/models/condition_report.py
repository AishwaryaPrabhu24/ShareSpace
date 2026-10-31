
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ConditionReport(Base):

    __tablename__ = "condition_reports"

    # Primary key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Related booking
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id"),
        nullable=False
    )

    # Person submitting the report
    reported_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # Report type: check_in or check_out
    report_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # Physical condition
    condition_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # Additional observations
    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Report creation time
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
