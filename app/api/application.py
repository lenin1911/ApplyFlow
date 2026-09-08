from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatus,
    ApplicationUpdate,
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create job application",
    description="Create a new job application for the authenticated user.",
)
async def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    applied_dt = application.applied_date or datetime.now(timezone.utc)
    if applied_dt.tzinfo is None:
        applied_dt = applied_dt.replace(tzinfo=timezone.utc)

    new_application = Application(
        company_name=application.company_name,
        job_title=application.job_title,
        status=application.status.value,
        applied_date=applied_dt,
        job_url=application.job_url,
        notes=application.notes,
        user_id=current_user.id,
    )

    db.add(new_application)
    await db.commit()
    await db.refresh(new_application)

    return new_application


@router.get(
    "/",
    response_model=list[ApplicationResponse],
    summary="List job applications",
    description="Get a paginated list of job applications for the authenticated user, with optional filtering and search.",
)
async def get_applications(
    status: ApplicationStatus | None = Query(default=None, description="Filter by application status"),
    company: str | None = Query(default=None, description="Search company name (case-insensitive, partial match)"),
    page: int = Query(default=1, ge=1, description="Page number (>= 1)"),
    limit: int = Query(default=10, ge=1, le=100, description="Items per page (1-100)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Application).where(
        Application.user_id == current_user.id
    )

    if status is not None:
        query = query.where(Application.status == status.value)

    if company is not None and company.strip():
        query = query.where(Application.company_name.ilike(f"%{company.strip()}%"))

    # Sort newest applied_date first, with id.desc() as secondary sort for deterministic pagination
    query = (
        query.order_by(Application.applied_date.desc(), Application.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get(
    "/stats",
    response_model=dict[str, int],
    summary="Get application statistics",
    description="Get application counts grouped by status for the authenticated user.",
)
async def get_application_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Application.status,
            func.count(Application.id),
        )
        .where(Application.user_id == current_user.id)
        .group_by(Application.status)
    )

    stats = result.all()

    response = {
        "total": 0,
        ApplicationStatus.APPLIED.value: 0,
        ApplicationStatus.INTERVIEW.value: 0,
        ApplicationStatus.REJECTED.value: 0,
        ApplicationStatus.OFFER.value: 0,
    }

    for status_name, count in stats:
        if status_name in response:
            response[status_name] = count
        response["total"] += count

    return response


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Get application by ID",
    description="Retrieve a single application belonging to the authenticated user.",
)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
    )

    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@router.put(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Update application",
    description="Update an existing job application belonging to the authenticated user.",
)
async def update_application(
    application_id: int,
    application: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
    )

    existing_application = result.scalar_one_or_none()

    if not existing_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    applied_dt = application.applied_date or existing_application.applied_date
    if applied_dt.tzinfo is None:
        applied_dt = applied_dt.replace(tzinfo=timezone.utc)

    existing_application.company_name = application.company_name
    existing_application.job_title = application.job_title
    existing_application.status = application.status.value
    existing_application.applied_date = applied_dt
    existing_application.job_url = application.job_url
    existing_application.notes = application.notes

    await db.commit()
    await db.refresh(existing_application)

    return existing_application


@router.delete(
    "/{application_id}",
    summary="Delete application",
    description="Delete an application belonging to the authenticated user.",
)
async def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
    )

    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    await db.delete(application)
    await db.commit()

    return {"message": "Application deleted successfully"}