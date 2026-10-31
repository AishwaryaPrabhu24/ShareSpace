
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# Request schema for check-in and check-out
class ConditionReportCreate(BaseModel):

    condition_status: Literal[
        "excellent",
        "good",
        "fair",
        "damaged",
        "non_functional"
    ]

    remarks: str | None = Field(
        default=None,
        max_length=1000
    )


# Response schema
class ConditionReportResponse(BaseModel):

    id: int
    booking_id: int
    reported_by: int
    report_type: str
    condition_status: str
    remarks: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
