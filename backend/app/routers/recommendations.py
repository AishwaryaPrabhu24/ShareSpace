
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.resource import Resource
from app.models.user import User
from app.ml.recommendation import recommend_resources


router = APIRouter(
    prefix="/api/recommendations",
    tags=["AI Recommendations"]
)


@router.get("/")
def get_recommendations(
    q: str = Query(
        ...,
        min_length=2,
        description="Describe the resource you are looking for"
    ),
    top_n: int = Query(
        default=5,
        ge=1,
        le=20
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch currently available resources
    statement = select(Resource).where(
        Resource.is_available.is_(True),
        Resource.quantity >= 1
    )

    resources = db.scalars(statement).all()

    # Generate ML recommendations
    recommendations = recommend_resources(
        search_query=q,
        resources=resources,
        top_n=top_n
    )

    return {
        "search_query": q,
        "total_recommendations": len(recommendations),
        "recommendations": recommendations
    }
