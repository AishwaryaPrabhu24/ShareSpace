from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class WaitingListCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str = Field(..., min_length=5)

    @model_validator(mode="after")
    def validate_booking_time(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time.")
        return self


class WaitingListResponse(BaseModel):
    id: int
    user_id: int
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str
    position: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)