from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate,UserLogin
from app.core.security import hash_password,verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # 1. Check whether email already exists
    result = await db.execute(
        select(User).where(User.email == user.email)
    )

    existing_user = result.scalar_one_or_none()

    # 2. If exists, stop registration
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # 3. Hash password
    hashed_password = hash_password(user.password)

    # 4. Create database user
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )

    # 5. Save to PostgreSQL
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email
    }

@router.post("/login")
async def login(
    user: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )

    existing_user = result.scalar_one_or_none()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": existing_user.id,
        "username": existing_user.username
    }