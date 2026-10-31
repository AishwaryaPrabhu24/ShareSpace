
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# Request schema for reporting an incident
class IncidentCreate(BaseModel):

    booking_id: int | None = None

    title: str = Field(
        min_length=3,
        max_length=150
    )

    description: str = Field(
        min_length=10,
        max_length=2000
    )

    severity: Literal[
        "low",
        "medium",
        "high",
        "critical"
    ] = "medium"


# Request schema for updating incident status
class IncidentUpdate(BaseModel):

    status: Literal[
        "open",
        "investigating",
        "resolved",
        "rejected"
    ]

    resolution_remarks: str | None = Field(
        default=None,
        max_length=1000
    )


# Response schema
class IncidentResponse(BaseModel):

    id: int
    booking_id: int | None
    reported_by: int
    title: str
    description: str
    severity: str
    status: str
    resolution_remarks: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
