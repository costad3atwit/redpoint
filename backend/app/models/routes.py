from sqlalchemy import ARRAY, Boolean, Column, Enum, Integer, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.sql import func

import enum

from app.db.database import Base

class SendType(str, enum.Enum):
    onsight = "onsight"
    flash = "flash"
    send = "send"
    attempt = "attempt"
    redpoint = "redpoint"

class Routes(Base):
    __tablename__ = "routes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        ForeignKey("sessions.id"),
        nullable=False
    )

    grade = Column(
        String,
        nullable=False
    )

    style_tags = Column(
        ARRAY(String),
        nullable=True
    )

    wall_angle = Column(
        Integer,
        nullable=True
    )

    sent = Column(
        Boolean,
        nullable=False,
        default=False
    )

    send_type = Column(
        Enum(SendType),
        nullable=True
    )

    attempts = Column(
        Integer,
        nullable=True
    )
    