
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# Schema for adding eligibility requirements to a resource
class ResourceEligibilityCreate(BaseModel):

    resource_id: int

    criterion_type: Literal[
        "department",
        "training"
    ]

    criterion_value: str = Field(
        min_length=2,
        max_length=150
    )


# Schema for submitting user qualifications
class UserQualificationCreate(BaseModel):

    qualification_type: Literal[
        "department",
        "training"
    ]

    qualification_value: str = Field(
        min_length=2,
        max_length=150
    )


# Schema for verifying user qualifications
class UserQualificationVerification(BaseModel):

    is_verified: bool


# Response schema for resource eligibility
class ResourceEligibilityResponse(BaseModel):

    id: int
    resource_id: int
    criterion_type: str
    criterion_value: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Response schema for user qualifications
class UserQualificationResponse(BaseModel):

    id: int
    user_id: int
    qualification_type: str
    qualification_value: str
    is_verified: bool
    verified_by: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Response schema for eligibility checking
class EligibilityCheckResponse(BaseModel):

    eligible: bool
    message: str
    missing_requirements: list[str]
