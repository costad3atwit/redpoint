import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    duration_minutes = Column(Integer, nullable=False)
    rpe = Column(Integer, nullable=False) 
    finger_load_rating = Column(Integer, nullable=False) 
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="sessions")
    route_attempts = relationship("RouteAttempt", back_populates="session", cascade="all, delete-orphan")