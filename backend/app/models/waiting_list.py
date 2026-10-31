
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class WaitingList(Base):

    __tablename__ = "waiting_list"

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

    # Requested schedule
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    # Purpose of request
    purpose: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Position in the waiting queue
    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # Waiting-list status
    status: Mapped[str] = mapped_column(
        String(30),
        default="waiting",
        nullable=False
    )

    # Creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
