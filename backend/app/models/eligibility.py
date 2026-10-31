
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Boolean
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ResourceEligibility(Base):

    __tablename__ = "resource_eligibility"

    # Primary key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # Resource requiring eligibility
    resource_id: Mapped[int] = mapped_column(
        ForeignKey("resources.id"),
        nullable=False
    )

    # Requirement type: department or training
    criterion_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    # Required department or training name
    criterion_value: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    # Creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class UserQualification(Base):

    __tablename__ = "user_qualifications"

    # Primary key
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    # User associated with the qualification
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # Qualification type: department or training
    qualification_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    # Department or completed training name
    qualification_value: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    # Admin verification status
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Admin who verified the qualification
    verified_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    # Creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
