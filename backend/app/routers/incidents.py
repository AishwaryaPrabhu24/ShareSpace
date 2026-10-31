
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models.incident import Incident
from app.models.booking import Booking
from app.models.resource import Resource
from app.models.user import User
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse
)


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)


# 1. Report a new incident
@router.post(
    "/",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Verify booking if booking_id is provided
    if incident_data.booking_id is not None:

        booking = db.get(Booking, incident_data.booking_id)

        if booking is None:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )

        # Only the booking user, resource owner, or admin can report
        resource = db.get(Resource, booking.resource_id)

        if (
            current_user.role != "admin"
            and current_user.id != booking.user_id
            and (
                resource is None
                or current_user.id != resource.owner_id
            )
        ):
            raise HTTPException(
                status_code=403,
                detail="You cannot report an incident for this booking"
            )

    incident = Incident(
        booking_id=incident_data.booking_id,
        reported_by=current_user.id,
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="open"
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


# Helper: check whether a user can access an incident
def can_access_incident(
    incident: Incident,
    current_user: User,
    db: Session
) -> bool:

    if current_user.role == "admin":
        return True

    if incident.reported_by == current_user.id:
        return True

    if incident.booking_id is not None:
        booking = db.get(Booking, incident.booking_id)

        if booking is not None:
            resource = db.get(Resource, booking.resource_id)

            if (
                resource is not None
                and resource.owner_id == current_user.id
            ):
                return True

    return False


# 2. View incidents based on role
@router.get(
    "/",
    response_model=list[IncidentResponse]
)
def get_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    statement = select(Incident).order_by(
        Incident.created_at.desc()
    )

    incidents = db.scalars(statement).all()

    return [
        incident
        for incident in incidents
        if can_access_incident(incident, current_user, db)
    ]


# 3. View a specific incident
@router.get(
    "/{incident_id}",
    response_model=IncidentResponse
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    incident = db.get(Incident, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    if not can_access_incident(incident, current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this incident"
        )

    return incident


# 4. Update incident status
@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse
)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    incident = db.get(Incident, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Only Admin or the related resource owner can update
    if current_user.role != "admin":

        if current_user.role != "owner":
            raise HTTPException(
                status_code=403,
                detail="Only Admin or Resource Owner can update incidents"
            )

        if incident.booking_id is None:
            raise HTTPException(
                status_code=403,
                detail="Only Admin can update general incidents"
            )

        booking = db.get(Booking, incident.booking_id)

        if booking is None:
            raise HTTPException(
                status_code=404,
                detail="Related booking not found"
            )

        resource = db.get(Resource, booking.resource_id)

        if resource is None or resource.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You cannot update this incident"
            )

    incident.status = incident_data.status
    incident.resolution_remarks = incident_data.resolution_remarks

    db.commit()
    db.refresh(incident)

    return incident
