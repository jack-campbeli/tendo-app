from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# SQLModel: ORM for database operations
from sqlmodel import (
    SQLModel,
    create_engine,
    Session,
    select,
)

import uuid, json
from models import (
    Form,
    FormSubmission,
    User,
    LoginRequest,
    LoginResponse,
)  # Our custom models

# Database setup - creates connection to SQLite database file
engine = create_engine("sqlite:///database.db")  # SQLite stores data in a local file


def get_session():
    with Session(engine) as session:
        yield session


def _initialize_dummy_users():
    """
    Initialize dummy users in the database if they don't exist.
    This function is called on application startup.
    """
    with Session(engine) as session:

        # get all users
        statement = select(User)
        existing_users = session.exec(statement).all()

        # if not users, create dummy users
        if len(existing_users) == 0:

            patient_user = User(
                email="jack@gmail.com",
                password="1111",  # In production, use hashed passwords
                user_type="patient",
                first_name="Jack",
                last_name="Campbell",
                recent_diagnosis="Type 2 Diabetes",
                primary_care_physician="Dr. Sarah Johnson",
            )

            # Create dummy admin user
            admin_user = User(
                email="maggie@gmail.com",
                password="1234",  # In production, use hashed passwords
                user_type="admin",
                first_name="Maggie",
                last_name="Wong",
                recent_diagnosis=None,  # Admins don't have patient-specific fields
                primary_care_physician=None,
            )

            session.add(patient_user)
            session.add(admin_user)
            session.commit()
            print("✓ Dummy users initialized in database")
        else:
            print(f"✓ Found {len(existing_users)} existing user(s) in database")


# runs when the FASTAPI starts up
@asynccontextmanager
async def lifespan(app: FastAPI):
    # create tables and users if they don't exist
    SQLModel.metadata.create_all(engine)
    _initialize_dummy_users()
    yield
    # Cleanup: close the database connection
    engine.dispose()

# create the FASTAPI app (runs lifespan() above)
app = FastAPI(lifespan=lifespan)


# !! make sure to update so that only the frontend can access the backend !!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can later restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# create a form
@app.post("/api/forms")
async def create_form(form: dict, session: Session = Depends(get_session)):
    form_id = str(uuid.uuid4())
    db_form = Form(
        id=form_id, form_name=form["form_name"], fields=json.dumps(form["fields"])
    )

    # Session manages database transactions - automatically handles connection/cleanup
    session.add(db_form)
    session.commit()

    return {"form_id": form_id}


# get the most recent form
@app.get("/api/forms/latest")
async def get_latest_form(session: Session = Depends(get_session)):
    statement = select(Form).order_by(Form.created_at.desc())
    latest_form = session.exec(statement).first()

    if not latest_form:
        raise HTTPException(status_code=404, detail="No forms found")

    return {
        "id": latest_form.id,
        "form_name": latest_form.form_name,
        "fields": json.loads(latest_form.fields),
    }


# save a form submission
@app.post("/api/submissions")
async def save_submission(submission: dict, session: Session = Depends(get_session)):
    db_submission = FormSubmission(
        form_id=submission["form_id"],
        submission_data=json.dumps(submission["submission_data"]),
    )
    session.add(db_submission)
    session.commit()
    return {"status": "success"}


# get all form submissions
@app.get("/api/submissions")
async def get_submissions(session: Session = Depends(get_session)):
    statement = select(FormSubmission).order_by(FormSubmission.submitted_at.desc())
    submissions = session.exec(statement).all()

    # We need to parse the JSON string back into an object for the frontend
    return [
        {
            "id": s.id,
            "form_id": s.form_id,
            "submission_data": json.loads(s.submission_data),
            "submitted_at": s.submitted_at,
        }
        for s in submissions
    ]


# get a form
@app.get("/api/forms/{form_id}")
async def get_form(form_id: str, session: Session = Depends(get_session)):
    # session.get() retrieves a record by primary key (id)
    db_form = session.get(Form, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")

    # json.loads converts JSON string back to Python dict for the API response
    return {"form_name": db_form.form_name, "fields": json.loads(db_form.fields)}


# login endpoint
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user with email and password.
    Returns user type (patient or admin) on successful login.
    Queries the database for user credentials.
    """
    email = credentials.email.lower().strip()
    password = credentials.password

    # Query database for user by email
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    # Check if user exists
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password (in production, use hashed password comparison)
    if user.password != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Successful login
    return LoginResponse(
        success=True,
        user_type=user.user_type,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        message=f"Welcome back, {user.first_name}! Logged in as {user.user_type}.",
    )


# get user information by email
@app.get("/api/users/{email}")
async def get_user_info(email: str, session: Session = Depends(get_session)):
    """
    Retrieve user information by email.
    Returns user details including patient-specific fields if applicable.
    """
    email = email.lower().strip()

    # Query database for user by email
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Build response with all user fields
    user_data = {
        "id": user.id,
        "email": user.email,
        "user_type": user.user_type,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "created_at": user.created_at,
    }

    # Include patient-specific fields if user is a patient
    if user.user_type == "patient":
        user_data["recent_diagnosis"] = user.recent_diagnosis
        user_data["primary_care_physician"] = user.primary_care_physician

    return user_data


# test endpoint
@app.get("/api/test")
async def test_endpoint():
    return {"message": "FastAPI is working!"}


# debug endpoint
@app.get("/api/forms")
async def debug_forms(session: Session = Depends(get_session)):
    statement = select(Form)
    forms = session.exec(statement).all()
    return [
        {
            "id": f.id,
            "form_name": f.form_name,
            "fields": f.fields,
            "created_at": f.created_at,
        }
        for f in forms
    ]
