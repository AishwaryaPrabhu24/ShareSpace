
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.permissions import require_admin
from app.schemas.user import AdminUserResponse, UserRoleUpdate


router = APIRouter(
    prefix="/api/users",
    tags=["User Management"]
)


# 1. Get all registered users (Admin only)
@router.get(
    "/",
    response_model=list[AdminUserResponse]
)
def get_all_users(
    role: str | None = Query(
        default=None,
        pattern="^(admin|owner|seeker)$"
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = select(User).order_by(User.created_at.desc())

    if role:
        query = query.where(User.role == role)

    users = db.scalars(
        query.offset(skip).limit(limit)
    ).all()

    return users


# 2. Update a user's role (Admin only)
@router.patch(
    "/{user_id}/role",
    response_model=AdminUserResponse
)
def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Prevent the administrator from accidentally removing
    # their own admin privileges.
    if user.id == current_user.id and role_data.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own administrator role"
        )

    # Avoid unnecessary database updates.
    if user.role == role_data.role:
        return user

    user.role = role_data.role

    db.commit()
    db.refresh(user)

    return user
