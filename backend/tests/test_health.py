"""
Tests for health and utility endpoints.
Focus: Basic health checks and test endpoints.
"""

from sqlmodel import Session


def test_test_endpoint(session: Session, client):
    """Test the test endpoint."""
    response = client.get("/api/test")

    # verify status 200 OK
    assert response.status_code == 200
    assert response.json() == {"message": "FastAPI is working!"}
