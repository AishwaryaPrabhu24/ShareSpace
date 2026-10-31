
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resource import Resource
from app.models.user import User
from app.models.booking import Booking
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse
)
from app.permissions import require_roles
from app.services.audit_log_service import create_audit_log


router = APIRouter(
    prefix="/api/resources",
    tags=["Resources"]
)


# 1. Add a new resource
# Only Admin and Owner can create resources.
@router.post(
    "/",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner")
    )
):
    new_resource = Resource(
        **resource_data.model_dump(),
        owner_id=current_user.id
    )

    db.add(new_resource)
    db.flush()

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="RESOURCE_CREATED",
        entity_type="Resource",
        entity_id=new_resource.id,
        description=f"Resource '{new_resource.name}' was created.",
        details={
            "resource_name": new_resource.name,
            "category": new_resource.category
        }
    )

    print("AUDIT LOG CREATED:", new_resource.id)

    db.commit()
    db.refresh(new_resource)

    return new_resource


# 2. Get all resources with search and filters
# All authenticated roles can view resources.
@router.get(
    "/",
    response_model=list[ResourceResponse]
)
def get_all_resources(
    search: str | None = None,
    category: str | None = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner", "seeker")
    )
):
    query = select(Resource)

    if search:
        search_term = f"%{search.strip()}%"

        query = query.where(
            or_(
                Resource.name.ilike(search_term),
                Resource.description.ilike(search_term)
            )
        )

    if category:
        query = query.where(
            Resource.category.ilike(category.strip())
        )

    if available_only:
        query = query.where(
            Resource.is_available == True
        )

    query = query.order_by(Resource.id.desc())

    resources = db.scalars(query).all()

    return resources


# 3. Get resources belonging to the logged-in Owner
# Only Owner can access this endpoint.
@router.get(
    "/my",
    response_model=list[ResourceResponse]
)
def get_my_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("owner")
    )
):
    resources = db.scalars(
        select(Resource)
        .where(Resource.owner_id == current_user.id)
        .order_by(Resource.id.desc())
    ).all()

    return resources


# 4. Get a resource by ID
# All authenticated roles can view a resource.
@router.get(
    "/{resource_id}",
    response_model=ResourceResponse
)
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner", "seeker")
    )
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    return resource


# 5. Update a resource
# Admin can update any resource.
# Owner can update only their own resource.
@router.put(
    "/{resource_id}",
    response_model=ResourceResponse
)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner")
    )
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    if (
        current_user.role != "admin"
        and resource.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own resources"
        )

    update_data = resource_data.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    for key, value in update_data.items():
        setattr(resource, key, value)

    # Create audit log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="RESOURCE_UPDATED",
        entity_type="Resource",
        entity_id=resource.id,
        description=f"Resource '{resource.name}' was updated.",
        details={
            "updated_fields": list(update_data.keys())
        }
    )

    db.commit()
    db.refresh(resource)

    return resource


# 6. Delete a resource
# Admin can delete any resource.
# Owner can delete only their own resource.
@router.delete(
    "/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("admin", "owner")
    )
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    if (
        current_user.role != "admin"
        and resource.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own resources"
        )

    # Prevent deletion if booking records exist.
    existing_booking = db.scalar(
        select(Booking.id)
        .where(Booking.resource_id == resource_id)
        .limit(1)
    )

    if existing_booking is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This resource cannot be deleted because "
                "booking records are associated with it."
            )
        )

    # Create audit log before deleting the resource.
    create_audit_log(
        db=db,
        user_id=current_user.id,
        user_role=current_user.role,
        action="RESOURCE_DELETED",
        entity_type="Resource",
        entity_id=resource.id,
        description=f"Resource '{resource.name}' was deleted.",
        details={
            "resource_name": resource.name,
            "category": resource.category
        }
    )

    db.delete(resource)
    db.commit()

    return None
