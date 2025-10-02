from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, UTC
from pydantic import BaseModel


class Form(SQLModel, table=True):
    """Represents a form created by an admin."""

    id: str = Field(default=None, primary_key=True)
    form_name: str
    fields: str  # Store fields as a JSON string
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class FormSubmission(SQLModel, table=True):
    """Represents a user's form submission."""

    id: int = Field(default=None, primary_key=True)
    form_id: str
    submission_data: str  # Store submission data as a JSON string
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class User(SQLModel, table=True):
    """
    Base user model for both patients and admins.
    Uses a single-table inheritance pattern with discriminator field (user_type).
    """

    id: int = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str  # In production, this should be hashed
    user_type: str  # "patient" or "admin"
    first_name: str
    last_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Patient-specific fields (None for admin users)
    recent_diagnosis: Optional[str] = Field(default=None)
    primary_care_physician: Optional[str] = Field(default=None)

    # Future fields for expansion
    # medications: Optional[str] = Field(default=None)  # Store as JSON string
    # allergies: Optional[str] = Field(default=None)  # Store as JSON string
    # medical_history: Optional[str] = Field(default=None)  # Store as JSON string
    # insurance_info: Optional[str] = Field(default=None)  # Store as JSON string


class LoginRequest(BaseModel):
    """Request model for login endpoint."""

    email: str
    password: str


class LoginResponse(BaseModel):
    """Response model for successful login."""

    success: bool
    user_type: str  # "patient" or "admin"
    email: str
    first_name: str
    last_name: str
    message: str
