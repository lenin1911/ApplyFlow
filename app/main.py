from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.application import router as application_router
from app.api.auth import router as auth_router
from app.core.config import ALLOWED_ORIGINS
from app.db.session import engine

tags_metadata = [
    {
        "name": "Authentication",
        "description": "User registration, login authentication, and profile management.",
    },
    {
        "name": "Applications",
        "description": "Application tracking CRUD, filtering, search, pagination, and statistics.",
    },
]

app = FastAPI(
    title="ApplyFlow API",
    description="Placement Tracker & Job Application Tracking Backend API",
    version="1.0.0",
    openapi_tags=tags_metadata,
)

# CORS configuration for development and React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(application_router)


@app.get("/", summary="Root status check")
async def root():
    return {"message": "Placement Tracker API is running"}


@app.get("/test-db", summary="Database connectivity check")
async def test_db():
    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}