from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.api.auth import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


@router.post("/", response_model=ApplicationResponse)
async def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_application = Application(
        company_name=application.company_name,
        job_title=application.job_title,
        status=application.status,
        applied_date=application.applied_date,
        job_url=application.job_url,
        notes=application.notes,
        user_id=current_user.id
    )

    db.add(new_application)

    await db.commit()
    await db.refresh(new_application)

    return new_application


@router.get("/", response_model=list[ApplicationResponse])
async def get_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            Application.user_id == current_user.id
        )
    )

    applications = result.scalars().all()

    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
    )

    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
    )

    existing_application = result.scalar_one_or_none()

    if not existing_application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    existing_application.company_name = application.company_name
    existing_application.job_title = application.job_title
    existing_application.status = application.status
    existing_application.applied_date = application.applied_date
    existing_application.job_url = application.job_url
    existing_application.notes = application.notes

    await db.commit()
    await db.refresh(existing_application)

    return existing_application

@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id
        )
    )

    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    await db.delete(application)
    await db.commit()

    return {
        "message": "Application deleted successfully"
    }