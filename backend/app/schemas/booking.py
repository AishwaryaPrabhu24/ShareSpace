
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BookingCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str = Field(min_length=5, max_length=500)

    @model_validator(mode="after")
    def validate_booking_time(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be later than start time")

        return self


class BookingResponse(BaseModel):
    id: int
    user_id: int
    resource_id: int
    start_time: datetime
    end_time: datetime
    status: str
    purpose: str
    decision_remarks: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingDecision(BaseModel):
    status: str
    decision_remarks: str | None = Field(
        default=None,
        max_length=500
    )

    @model_validator(mode="after")
    def validate_decision(self):
        if self.status not in ["approved", "rejected"]:
            raise ValueError(
                "Status must be either approved or rejected"
            )

        return self
