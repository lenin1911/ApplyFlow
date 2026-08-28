from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine

app = FastAPI()
@app.get("/")
async def root():
    return {"message": "Placement Tracker API is running"}


@app.get("/test-db")
async def test_db():
    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}