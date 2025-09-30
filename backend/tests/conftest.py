"""
Shared test fixtures and utilities for all test files.
This file is automatically discovered by pytest and provides common fixtures.
"""

from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import StaticPool
import pytest
import sys
import os

# update sys.path to be the backend directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, get_session

# database reference (sqlite://:in-memory SQLite database)
DATABASE_URL = "sqlite://"
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # allow multithreading
    poolclass=StaticPool,  # need this for shared session between pytest.fixture and fastapi app
)


# create test session
def get_test_session():
    with Session(engine) as session:
        yield session


# override get_session with get_test_session
app.dependency_overrides[get_session] = get_test_session


# A pytest fixture is a function that runs before each test function that uses it.
@pytest.fixture(name="session")
def session_fixture():
    # create the database tables
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # yield the session to the test
        yield session
    # drop the database tables after the test finishes
    SQLModel.metadata.drop_all(engine)


# The TestClient is a special class from FastAPI that lets us make requests
# to our application in our tests without having to run a live server.

# create test client
client = TestClient(app)


@pytest.fixture(name="client")
def client_fixture():
    """Provide a test client for making HTTP requests."""
    return client
