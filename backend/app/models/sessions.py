from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    duration_minutes = Column(Integer, nullable=False)
    rpe = Column(Integer, nullable=False) 
    finger_load_rating = Column(Integer, nullable=False) 
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="sessions")
    routes = relationship("Route", back_populates="session", cascade="all, delete-orphan")