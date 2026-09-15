from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import JobApplication
import db_models


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Job Application Tracker API",
    description="API for managing and tracking job applications.",
    version="1.0.0"
)


# Allow the frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Job Application Tracker API is running!"
    }


# CREATE APPLICATION
@app.post("/applications")
def create_application(
    application: JobApplication,
    db: Session = Depends(get_db)
):
    new_application = db_models.JobApplicationDB(
        company=application.company,
        position=application.position,
        status=application.status,
        job_url=application.job_url,
        location=application.location,
        notes=application.notes
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return new_application


# GET ALL APPLICATIONS
@app.get("/applications")
def get_applications(
    db: Session = Depends(get_db)
):
    return (
        db.query(db_models.JobApplicationDB)
        .order_by(db_models.JobApplicationDB.created_at.desc())
        .all()
    )


# GET ONE APPLICATION
@app.get("/applications/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.id == application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return application


# UPDATE APPLICATION
@app.put("/applications/{application_id}")
def update_application(
    application_id: int,
    updated_application: JobApplication,
    db: Session = Depends(get_db)
):
    application = (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.id == application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
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
    db: Session = Depends(get_db)
):
    application = (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.id == application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.status = status

    db.commit()
    db.refresh(application)

    return application


# DELETE APPLICATION
@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = (
        db.query(db_models.JobApplicationDB)
        .filter(
            db_models.JobApplicationDB.id == application_id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }