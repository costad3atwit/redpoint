import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    bio = Column(Text, nullable=True)
    home_gym = Column(String, nullable=True)
    favorited_route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="SET NULL"), nullable=True)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="user", foreign_keys = "[Route.user_id]", cascade="all, delete-orphan")
    favorited_route = relationship("Route", foreign_keys=[favorited_route_id])