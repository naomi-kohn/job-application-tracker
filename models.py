from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class JobApplication(BaseModel):
    company: str
    position: str
    status: str = "Applied"
    job_url: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None