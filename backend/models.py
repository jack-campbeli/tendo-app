from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, UTC


class Form(SQLModel, table=True):
    """Represents a form created by an admin."""

    id: str = Field(default=None, primary_key=True)
    form_name: str
    fields: str  # Store fields as a JSON string
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class FormSubmission(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    form_id: str
    submission_data: str  # Store submission data as a JSON string
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
