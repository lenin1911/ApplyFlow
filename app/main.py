from fastapi import FastAPI
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.application import router as application_router

from app.db.session import engine

app = FastAPI()

app.include_router(auth_router)
app.include_router(application_router)


@app.get("/")
async def root():
    return {"message": "Placement Tracker API is running"}


@app.get("/test-db")
async def test_db():
    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}