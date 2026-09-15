from pydantic import BaseModel
from typing import Optional


class JobApplication(BaseModel):
    company: str
    position: str
    status: str = "Applied"
    job_url: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None