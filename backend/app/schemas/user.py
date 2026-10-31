
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# 1. User Registration Schema
class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)


# 2. User Login Schema
class UserLogin(BaseModel):
    email: str
    password: str


# 3. User Response Schema
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 4. JWT Token Response Schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# 5. Admin User List Response Schema
class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 6. Admin User Role Update Schema
class UserRoleUpdate(BaseModel):
    role: Literal["admin", "owner", "seeker"]
    