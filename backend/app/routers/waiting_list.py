
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.resource import Resource
from app.models.waiting_list import WaitingList
from app.schemas.waiting_list import (
    WaitingListCreate,
    WaitingListResponse,
)
from app.permissions import require_seeker


router = APIRouter(
    prefix="/api/waiting-list",
    tags=["Waiting List"]
)


@router.post("/", response_model=WaitingListResponse)
def join_waiting_list(
    waiting_data: WaitingListCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_seeker),
):
    resource = db.query(Resource).filter(
        Resource.id == waiting_data.resource_id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found."
        )

    if waiting_data.start_time >= waiting_data.end_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time."
        )

    existing_entry = db.query(WaitingList).filter(
        WaitingList.user_id == current_user.id,
        WaitingList.resource_id == waiting_data.resource_id,
        WaitingList.start_time == waiting_data.start_time,
        WaitingList.end_time == waiting_data.end_time,
        WaitingList.status == "waiting",
    ).first()

    if existing_entry:
        raise HTTPException(
            status_code=409,
            detail="You are already on the waiting list for this time."
        )

    queue_position = db.query(
        func.max(WaitingList.position)
    ).filter(
        WaitingList.resource_id == waiting_data.resource_id,
        WaitingList.start_time == waiting_data.start_time,
        WaitingList.end_time == waiting_data.end_time,
        WaitingList.status == "waiting",
    ).scalar()

    next_position = (queue_position or 0) + 1

    waiting_entry = WaitingList(
        user_id=current_user.id,
        resource_id=waiting_data.resource_id,
        start_time=waiting_data.start_time,
        end_time=waiting_data.end_time,
        purpose=waiting_data.purpose,
        position=next_position,
        status="waiting",
    )

    db.add(waiting_entry)
    db.commit()
    db.refresh(waiting_entry)

    return waiting_entry


@router.get("/my", response_model=list[WaitingListResponse])
def get_my_waiting_list(
    db: Session = Depends(get_db),
    current_user=Depends(require_seeker),
):
    entries = db.query(WaitingList).filter(
        WaitingList.user_id == current_user.id
    ).order_by(
        WaitingList.created_at.desc()
    ).all()

    return entries


@router.patch("/{entry_id}/cancel")
def cancel_waiting_list_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_seeker),
):
    entry = db.query(WaitingList).filter(
        WaitingList.id == entry_id,
        WaitingList.user_id == current_user.id,
    ).first()

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Waiting-list entry not found."
        )

    if entry.status != "waiting":
        raise HTTPException(
            status_code=400,
            detail="Only waiting entries can be cancelled."
        )

    entry.status = "cancelled"

    db.commit()

    return {
        "message": "Waiting-list entry cancelled successfully."
    }
