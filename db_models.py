from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class UserDB(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    hashed_password = Column(
        String,
        nullable=False,
    )

    applications = relationship(
        "JobApplicationDB",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class JobApplicationDB(Base):
    __tablename__ = "job_applications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    company = Column(
        String,
        nullable=False,
    )

    position = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="Applied",
    )

    job_url = Column(
        String,
        nullable=True,
    )

    location = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    owner = relationship(
        "UserDB",
        back_populates="applications",
    )