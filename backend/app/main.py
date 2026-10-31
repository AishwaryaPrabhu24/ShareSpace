
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database imports
from app.database import engine
from app.models.base import Base

# Register all database models
import app.models

# Router imports
from app.routers.resources import router as resources_router
from app.routers.auth import router as auth_router
from app.routers.bookings import router as bookings_router
from app.routers.condition_reports import router as condition_reports_router
from app.routers.incidents import router as incidents_router
from app.routers.eligibility import router as eligibility_router
from app.routers.recommendations import router as recommendations_router
from app.routers.waiting_list import router as waiting_list_router
from app.routers import notifications
from app.routers import analytics
from app.routers import audit_logs
from app.routers import users


# Create missing database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI application
app = FastAPI(
    title="ShareSpace API",
    description="AI-Powered Institutional Resource Sharing Platform",
    version="1.0.0",
)


# Register API routers
app.include_router(resources_router)
app.include_router(auth_router)
app.include_router(bookings_router)
app.include_router(condition_reports_router)
app.include_router(incidents_router)
app.include_router(eligibility_router)
app.include_router(recommendations_router)
app.include_router(waiting_list_router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(audit_logs.router)
app.include_router(users.router)


# Allow React frontend to communicate with FastAPI
allowed_origins = [
    "http://localhost:5173",
    "https://share-space-mu.vercel.app",
]

# Add an optional frontend URL from environment variables
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to ShareSpace API",
        "status": "Backend is running"
    }


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "ShareSpace"
    }
