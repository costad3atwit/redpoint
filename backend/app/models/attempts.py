import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class RouteAttempt(Base):
    __tablename__ = "route_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    sent = Column(Boolean, default=False)
    send_type = Column(String, nullable=True)
    attempts = Column(Integer, default=1)
    route_length = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

    session = relationship("Session", back_populates="route_attempts")
    route = relationship("Route", back_populates="attempts")
