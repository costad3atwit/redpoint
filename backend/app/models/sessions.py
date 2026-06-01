from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    date = Column(
        Date,
        nullable=False
    )

    duration_minutes = Column(
        Integer,
        nullable=False
    )

#TODO: Find API for coordinates and location data
    #location = Column(

    #)

    rpe = Column(
        Integer,
        nullable=False
    )

    notes = Column(
        Text,
        nullable=True
    )

    finger_load_rating = Column(
        Integer,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),   
        server_default=func.now()
    )