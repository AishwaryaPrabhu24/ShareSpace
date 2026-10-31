from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResourceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str
    description: str
    location: str
    quantity: int = Field(default=1, ge=1)
    is_available: bool = True
    requires_approval: bool = True


class ResourceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = None
    description: str | None = None
    location: str | None = None
    quantity: int | None = Field(default=None, ge=1)
    is_available: bool | None = None
    requires_approval: bool | None = None


class ResourceResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    category: str
    description: str
    location: str
    quantity: int
    is_available: bool
    requires_approval: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)