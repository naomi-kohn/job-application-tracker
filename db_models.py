from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class JobApplicationDB(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)

    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Applied")

    job_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )