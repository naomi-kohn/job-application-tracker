from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import JobApplication, UserCreate, UserLogin
import db_models

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Job Application Tracker API",
    description="API for managing and tracking job applications.",
    version="2.0.0",
)


# Allow the local frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Job Application Tracker API is running!"
    }


# =========================================================
# AUTHENTICATION
# =========================================================

@app.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(db_models.UserDB)
        .filter(db_models.UserDB.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    new_user = db_models.UserDB(
        email=user.email,
        hashed_password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    database_user = (
        db.query(db_models.UserDB)
        .filter(db_models.UserDB.email == user.email)
        .first()
    )

    if (
        database_user is None
        or not verify_password(
            user.password,
            database_user.hashed_password,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(database_user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# =========================================================
# HELPER
# =========================================================

def find_application(
    application_id: int,
    user_id: int,
    db: Session,
):
    application = (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.id == application_id,
            db_models.JobApplicationDB.user_id == user_id,
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return application


# =========================================================
# APPLICATIONS
# =========================================================

# CREATE APPLICATION
@app.post("/applications")
def create_application(
    application: JobApplication,
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    new_application = db_models.JobApplicationDB(
        company=application.company,
        position=application.position,
        status=application.status,
        job_url=application.job_url,
        location=application.location,
        notes=application.notes,
        user_id=current_user.id,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


# GET ALL APPLICATIONS
@app.get("/applications")
def get_applications(
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    return (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.user_id
            == current_user.id
        )
        .order_by(
            db_models.JobApplicationDB.created_at.desc()
        )
        .all()
    )


# GET ONE APPLICATION
@app.get("/applications/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    return find_application(
        application_id,
        current_user.id,
        db,
    )


# UPDATE APPLICATION
@app.put("/applications/{application_id}")
def update_application(
    application_id: int,
    updated_application: JobApplication,
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    application = find_application(
        application_id,
        current_user.id,
        db,
    )

    application.company = updated_application.company
    application.position = updated_application.position
    application.status = updated_application.status
    application.job_url = updated_application.job_url
    application.location = updated_application.location
    application.notes = updated_application.notes

    db.commit()
    db.refresh(application)

    return application


# UPDATE APPLICATION STATUS
@app.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    application = find_application(
        application_id,
        current_user.id,
        db,
    )

    application.status = status

    db.commit()
    db.refresh(application)

    return application


# DELETE APPLICATION
@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.UserDB = Depends(
        get_current_user
    ),
):
    application = find_application(
        application_id,
        current_user.id,
        db,
    )

    db.delete(application)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }