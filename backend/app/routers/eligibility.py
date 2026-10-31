
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.eligibility import (
    ResourceEligibility,
    UserQualification
)
from app.models.resource import Resource
from app.models.user import User
from app.schemas.eligibility import (
    ResourceEligibilityCreate,
    UserQualificationCreate,
    UserQualificationVerification,
    ResourceEligibilityResponse,
    UserQualificationResponse,
    EligibilityCheckResponse
)


router = APIRouter(
    prefix="/api/eligibility",
    tags=["Eligibility Management"]
)


# 1. Add eligibility requirements to a resource
@router.post(
    "/requirements",
    response_model=ResourceEligibilityResponse,
    status_code=status.HTTP_201_CREATED
)
def add_resource_requirement(
    requirement_data: ResourceEligibilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin or Resource Owner can add requirements"
        )

    resource = db.get(Resource, requirement_data.resource_id)

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    if (
        current_user.role == "owner"
        and resource.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot modify requirements for this resource"
        )

    # Prevent duplicate requirements
    existing = db.scalar(
        select(ResourceEligibility).where(
            ResourceEligibility.resource_id == resource.id,
            ResourceEligibility.criterion_type == requirement_data.criterion_type,
            ResourceEligibility.criterion_value.ilike(
                requirement_data.criterion_value.strip()
            )
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This eligibility requirement already exists"
        )

    requirement = ResourceEligibility(
        resource_id=resource.id,
        criterion_type=requirement_data.criterion_type,
        criterion_value=requirement_data.criterion_value.strip()
    )

    db.add(requirement)
    db.commit()
    db.refresh(requirement)

    return requirement


# 2. View requirements for a resource
@router.get(
    "/resources/{resource_id}/requirements",
    response_model=list[ResourceEligibilityResponse]
)
def get_resource_requirements(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    statement = select(ResourceEligibility).where(
        ResourceEligibility.resource_id == resource_id
    )

    return db.scalars(statement).all()


# 3. Submit a user qualification
@router.post(
    "/qualifications",
    response_model=UserQualificationResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_qualification(
    qualification_data: UserQualificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    value = qualification_data.qualification_value.strip()

    existing = db.scalar(
        select(UserQualification).where(
            UserQualification.user_id == current_user.id,
            UserQualification.qualification_type == qualification_data.qualification_type,
            UserQualification.qualification_value.ilike(value)
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This qualification has already been submitted"
        )

    qualification = UserQualification(
        user_id=current_user.id,
        qualification_type=qualification_data.qualification_type,
        qualification_value=value,
        is_verified=False,
        verified_by=None
    )

    db.add(qualification)
    db.commit()
    db.refresh(qualification)

    return qualification


# 4. View current user's qualifications
@router.get(
    "/qualifications/me",
    response_model=list[UserQualificationResponse]
)
def get_my_qualifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    statement = select(UserQualification).where(
        UserQualification.user_id == current_user.id
    )

    return db.scalars(statement).all()


# 5. Admin verifies a submitted qualification
@router.patch(
    "/qualifications/{qualification_id}/verify",
    response_model=UserQualificationResponse
)
def verify_qualification(
    qualification_id: int,
    verification_data: UserQualificationVerification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can verify user qualifications"
        )

    qualification = db.get(
        UserQualification,
        qualification_id
    )

    if qualification is None:
        raise HTTPException(
            status_code=404,
            detail="Qualification not found"
        )

    qualification.is_verified = verification_data.is_verified

    qualification.verified_by = (
        current_user.id
        if verification_data.is_verified
        else None
    )

    db.commit()
    db.refresh(qualification)

    return qualification


# 6. Check user eligibility for a resource
@router.get(
    "/check/{resource_id}",
    response_model=EligibilityCheckResponse
)
def check_eligibility(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    requirements = db.scalars(
        select(ResourceEligibility).where(
            ResourceEligibility.resource_id == resource_id
        )
    ).all()

    qualifications = db.scalars(
        select(UserQualification).where(
            UserQualification.user_id == current_user.id,
            UserQualification.is_verified.is_(True)
        )
    ).all()

    missing_requirements = []

    for requirement in requirements:

        matched = any(
            qualification.qualification_type == requirement.criterion_type
            and qualification.qualification_value.casefold()
            == requirement.criterion_value.casefold()
            for qualification in qualifications
        )

        if not matched:
            missing_requirements.append(
                f"{requirement.criterion_type}: "
                f"{requirement.criterion_value}"
            )

    eligible = len(missing_requirements) == 0

    if eligible:
        message = "You are eligible to access this resource."
    else:
        message = "You do not meet all the eligibility requirements."

    return EligibilityCheckResponse(
        eligible=eligible,
        message=message,
        missing_requirements=missing_requirements
    )
