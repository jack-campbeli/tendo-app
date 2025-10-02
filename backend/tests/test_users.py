"""
Tests for user authentication and user information endpoints.
Focus: Login functionality and user data retrieval.
"""

from sqlmodel import Session
from models import User


def test_login_with_patient_user(session: Session, client):
    """Test successful login with patient credentials."""
    # Create a test patient user
    patient = User(
        email="test_patient@example.com",
        password="password123",
        user_type="patient",
        first_name="John",
        last_name="Doe",
        recent_diagnosis="Hypertension",
        primary_care_physician="Dr. Jane Smith",
    )
    session.add(patient)
    session.commit()

    # Attempt login
    response = client.post(
        "/api/auth/login",
        json={"email": "test_patient@example.com", "password": "password123"},
    )

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user_type"] == "patient"
    assert data["email"] == "test_patient@example.com"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert "Welcome back, John!" in data["message"]


def test_login_with_admin_user(session: Session, client):
    """Test successful login with admin credentials."""
    # Create a test admin user
    admin = User(
        email="test_admin@example.com",
        password="admin123",
        user_type="admin",
        first_name="Sarah",
        last_name="Johnson",
    )
    session.add(admin)
    session.commit()

    # Attempt login
    response = client.post(
        "/api/auth/login",
        json={"email": "test_admin@example.com", "password": "admin123"},
    )

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user_type"] == "admin"
    assert data["email"] == "test_admin@example.com"
    assert data["first_name"] == "Sarah"
    assert data["last_name"] == "Johnson"


def test_login_with_invalid_email(session: Session, client):
    """Test login with non-existent email."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"},
    )

    # Verify error response
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_with_invalid_password(session: Session, client):
    """Test login with incorrect password."""
    # Create a test user
    user = User(
        email="test_user@example.com",
        password="correct_password",
        user_type="patient",
        first_name="Test",
        last_name="User",
    )
    session.add(user)
    session.commit()

    # Attempt login with wrong password
    response = client.post(
        "/api/auth/login",
        json={"email": "test_user@example.com", "password": "wrong_password"},
    )

    # Verify error response
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_email_case_insensitive(session: Session, client):
    """Test that login email is case-insensitive."""
    # Create a test user with lowercase email
    user = User(
        email="test@example.com",
        password="password123",
        user_type="patient",
        first_name="Test",
        last_name="User",
    )
    session.add(user)
    session.commit()

    # Attempt login with uppercase email
    response = client.post(
        "/api/auth/login", json={"email": "TEST@EXAMPLE.COM", "password": "password123"}
    )

    # Verify successful login
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["email"] == "test@example.com"


def test_get_patient_user_info(session: Session, client):
    """Test retrieving patient user information."""
    # Create a test patient user
    patient = User(
        email="patient@example.com",
        password="password123",
        user_type="patient",
        first_name="Alice",
        last_name="Brown",
        recent_diagnosis="Asthma",
        primary_care_physician="Dr. Bob Wilson",
    )
    session.add(patient)
    session.commit()

    # Get user info
    response = client.get("/api/users/patient@example.com")

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "patient@example.com"
    assert data["user_type"] == "patient"
    assert data["first_name"] == "Alice"
    assert data["last_name"] == "Brown"
    assert data["recent_diagnosis"] == "Asthma"
    assert data["primary_care_physician"] == "Dr. Bob Wilson"


def test_get_admin_user_info(session: Session, client):
    """Test retrieving admin user information (no patient fields)."""
    # Create a test admin user
    admin = User(
        email="admin@example.com",
        password="admin123",
        user_type="admin",
        first_name="Charlie",
        last_name="Davis",
    )
    session.add(admin)
    session.commit()

    # Get user info
    response = client.get("/api/users/admin@example.com")

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@example.com"
    assert data["user_type"] == "admin"
    assert data["first_name"] == "Charlie"
    assert data["last_name"] == "Davis"
    # Patient-specific fields should not be present for admin
    assert "recent_diagnosis" not in data
    assert "primary_care_physician" not in data


def test_get_nonexistent_user_info(session: Session, client):
    """Test retrieving information for non-existent user."""
    response = client.get("/api/users/nonexistent@example.com")

    # Verify error response
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_user_email_uniqueness(session: Session):
    """Test that email field is unique in database."""
    # Create first user
    user1 = User(
        email="unique@example.com",
        password="password1",
        user_type="patient",
        first_name="First",
        last_name="User",
    )
    session.add(user1)
    session.commit()

    # Attempt to create second user with same email
    user2 = User(
        email="unique@example.com",
        password="password2",
        user_type="admin",
        first_name="Second",
        last_name="User",
    )
    session.add(user2)

    # This should raise an error due to unique constraint
    try:
        session.commit()
        assert False, "Expected IntegrityError for duplicate email"
    except Exception as e:
        # Rollback the failed transaction
        session.rollback()
        # Verify it's an integrity error related to unique constraint
        assert "UNIQUE constraint failed" in str(e) or "unique" in str(e).lower()
