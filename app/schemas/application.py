from datetime import datetime

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    status: str = "Applied"
    applied_date: datetime | None = None
    job_url: str | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    status: str
    applied_date: datetime
    job_url: str | None
    notes: str | None
    user_id: int

    class Config:
        from_attributes = True