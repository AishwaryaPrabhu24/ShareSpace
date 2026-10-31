from datetime import date
from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_resources: int
    available_resources: int
    unavailable_resources: int

    total_bookings: int
    approved_bookings: int
    pending_bookings: int
    rejected_bookings: int
    cancelled_bookings: int


class ResourceUtilizationResponse(BaseModel):
    resource_id: int
    resource_name: str
    category: str
    quantity: int

    total_bookings: int
    approved_bookings: int
    total_usage_hours: float
    utilization_percentage: float


class BookingTrendResponse(BaseModel):
    booking_date: date
    total_bookings: int
    approved_bookings: int
    rejected_bookings: int
    cancelled_bookings: int