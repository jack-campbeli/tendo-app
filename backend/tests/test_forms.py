"""
Tests for form-related endpoints.
Focus: Form creation, retrieval, and management.
"""

from sqlmodel import Session


def test_create_form(session: Session, client):
    """Test creating a form."""
    response = client.post(
        "/api/forms",
        json={
            "form_name": "Test Form",
            "fields": [{"name": "field1", "type": "text"}],
        },
    )

    # verify status 200 OK
    assert response.status_code == 200

    # check that form_id is in the response
    data = response.json()
    assert "form_id" in data


def test_get_form(session: Session, client):
    """Test retrieving a form."""
    form_data = {
        "form_name": "Another Test Form",
        "fields": [{"name": "field2", "type": "number"}],
    }

    # create test form via POST request
    create_response = client.post("/api/forms", json=form_data)
    form_id = create_response.json()["form_id"]

    # get test form via GET request
    get_response = client.get(f"/api/forms/{form_id}")

    # verify status 200 OK
    assert get_response.status_code == 200

    # check that form_name and fields are in the get_response
    data = get_response.json()
    assert data["form_name"] == form_data["form_name"]
    assert data["fields"] == form_data["fields"]


def test_get_nonexistent_form(session: Session, client):
    """Test retrieving a form that does not exist."""
    nonexistent_id = "blahblahblah-id"
    response = client.get(f"/api/forms/{nonexistent_id}")

    # verify status 404 Not Found
    assert response.status_code == 404
    assert response.json() == {"detail": "Form not found"}


def test_get_latest_form(session: Session, client):
    """Test retrieving the most recent form."""
    # create multiple forms
    form1_data = {
        "form_name": "First Form",
        "fields": [{"name": "field1", "type": "text"}],
    }
    form2_data = {
        "form_name": "Second Form",
        "fields": [{"name": "field2", "type": "email", "required": True}],
    }
    form3_data = {
        "form_name": "Third Form",
        "fields": [{"name": "field3", "type": "number"}],
    }

    client.post("/api/forms", json=form1_data)
    client.post("/api/forms", json=form2_data)
    client.post("/api/forms", json=form3_data)

    # get latest form
    response = client.get("/api/forms/latest")

    # verify status 200 OK
    assert response.status_code == 200

    # verify that the latest form is the third one
    data = response.json()
    assert data["form_name"] == form3_data["form_name"]
    assert data["fields"] == form3_data["fields"]
    assert "required" not in data["fields"][0]
    assert "id" in data


def test_get_latest_form_empty_database(session: Session, client):
    """Test retrieving the latest form when no forms exist."""
    response = client.get("/api/forms/latest")

    # verify status 404 Not Found
    assert response.status_code == 404
    assert response.json() == {"detail": "No forms found"}


def test_get_all_forms(session: Session, client):
    """Test the debug endpoint that retrieves all forms."""
    # create multiple forms
    form1_data = {
        "form_name": "Form One",
        "fields": [{"name": "field1", "type": "text"}],
    }
    form2_data = {
        "form_name": "Form Two",
        "fields": [{"name": "field2", "type": "number"}],
    }

    client.post("/api/forms", json=form1_data)
    client.post("/api/forms", json=form2_data)

    # get all forms
    response = client.get("/api/forms")

    # verify status 200 OK
    assert response.status_code == 200

    # verify we got both forms
    data = response.json()
    assert len(data) == 2
    assert all("id" in item for item in data)
    assert all("form_name" in item for item in data)
    assert all("fields" in item for item in data)
    assert all("created_at" in item for item in data)
