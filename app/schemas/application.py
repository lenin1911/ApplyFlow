from datetime import datetime, timezone
from enum import Enum
from urllib.parse import urlparse
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ApplicationStatus(str, Enum):
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    REJECTED = "Rejected"
    OFFER = "Offer"


class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100, description="Company name (1-100 characters)")
    job_title: str = Field(..., min_length=1, max_length=100, description="Job title (1-100 characters)")
    status: ApplicationStatus = Field(default=ApplicationStatus.APPLIED, description="Application status")
    applied_date: datetime | None = Field(default=None, description="Application date (defaults to current UTC time)")
    job_url: str | None = Field(default=None, max_length=500, description="Optional job posting URL")
    notes: str | None = Field(default=None, max_length=1000, description="Optional notes (up to 1000 characters)")

    @field_validator("company_name", "job_title", mode="before")
    @classmethod
    def validate_non_empty_strings(cls, v: str, info) -> str:
        if isinstance(v, str):
            v_stripped = v.strip()
            if not v_stripped:
                field_name = info.field_name or "Field"
                raise ValueError(f"{field_name} cannot be empty or whitespace only")
            return v_stripped
        return v

    @field_validator("job_url", mode="before")
    @classmethod
    def validate_job_url(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v_str = str(v).strip()
        if not v_str:
            return None
        parsed = urlparse(v_str)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("job_url must be a valid HTTP or HTTPS URL")
        return v_str

    @field_validator("applied_date", mode="after")
    @classmethod
    def ensure_timezone_aware(cls, v: datetime | None) -> datetime | None:
        if v is not None and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(ApplicationBase):
    pass


class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    status: str
    applied_date: datetime
    job_url: str | None = None
    notes: str | None = None
    user_id: int

    model_config = ConfigDict(from_attributes=True)