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
    LoginRequest,
    LoginResponse,
)  # Our custom models

# Database setup - creates connection to SQLite database file
engine = create_engine("sqlite:///database.db")  # SQLite stores data in a local file


def get_session():
    with Session(engine) as session:
        yield session


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs when FastAPI starts up - ensures database tables exist
    SQLModel.metadata.create_all(engine)
    yield
    # Cleanup code would go here (if needed)


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


# Dummy users for authentication (no sign-up functionality)
DUMMY_USERS = {
    "jack@gmail.com": {"password": "1111", "user_type": "patient"},
    "maggie@gmail.com": {"password": "1234", "user_type": "admin"},
}


# login endpoint
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user with email and password.
    Returns user type (patient or admin) on successful login.
    """
    email = credentials.email.lower().strip()
    password = credentials.password

    # Check if user exists in our dummy users
    if email not in DUMMY_USERS:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if DUMMY_USERS[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Successful login
    user_type = DUMMY_USERS[email]["user_type"]
    return LoginResponse(
        success=True,
        user_type=user_type,
        email=email,
        message=f"Welcome back! Logged in as {user_type}.",
    )


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
