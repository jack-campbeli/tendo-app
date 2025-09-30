"""
Tests for submission-related endpoints.
Focus: Form submission creation and retrieval.
"""

from sqlmodel import Session


def test_create_submission(session: Session, client):
    """Test creating a form submission."""
    # first create a form
    form_data = {
        "form_name": "Patient Intake Form",
        "fields": [{"name": "patient_name", "type": "text"}],
    }

    # post the form to database and get the form id
    form_response = client.post("/api/forms", json=form_data)
    form_id = form_response.json()["form_id"]

    # create a submission for that form
    submission_data = {
        "form_id": form_id,
        "submission_data": {"patient_name": "John Doe"},
    }
    response = client.post("/api/submissions", json=submission_data)

    # verify status 200 OK
    assert response.status_code == 200
    assert response.json() == {"status": "success"}


def test_get_submissions(session: Session, client):
    """Test retrieving all form submissions."""
    # create a form
    form_data = {
        "form_name": "Test Form",
        "fields": [{"name": "field1", "type": "text"}],
    }

    # post the form to database and get the form id
    form_response = client.post("/api/forms", json=form_data)
    form_id = form_response.json()["form_id"]

    # create multiple submissions
    submission1_data = {
        "form_id": form_id,
        "submission_data": {"field1": "value1"},
    }
    submission2_data = {
        "form_id": form_id,
        "submission_data": {"field1": "value2"},
    }

    # post the submissions to database
    client.post("/api/submissions", json=submission1_data)
    client.post("/api/submissions", json=submission2_data)

    # get all submissions
    response = client.get("/api/submissions")

    # verify status 200 OK
    assert response.status_code == 200

    # verify that we got both submissions
    data = response.json()
    assert len(data) == 2
    assert all("id" in item for item in data)
    assert all("form_id" in item for item in data)
    assert all("submission_data" in item for item in data)
    assert all("submitted_at" in item for item in data)

    # verify submissions are ordered by most recent first
    assert data[0]["submission_data"] == submission2_data["submission_data"]
    assert data[1]["submission_data"] == submission1_data["submission_data"]


def test_get_submissions_empty(session: Session, client):
    """Test retrieving submissions when none exist."""
    response = client.get("/api/submissions")

    # verify status 200 OK with empty list
    assert response.status_code == 200
    assert response.json() == []
