import uuid
import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, ARRAY, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class ClimbingEnvironment(str, enum.Enum):
    GYM = "gym"
    OUTDOOR = "outdoor"

class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4 ,index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String, nullable=False) 
    wall_angle = Column(String, nullable=True) 
    sent = Column(Boolean, default=False)
    send_type = Column(String, nullable=True) 
    attempts = Column(Integer, default=1)
    style_tags = Column(ARRAY(String), nullable=True)
    description = Column(String, nullable=True)
    environment = Column(Enum(ClimbingEnvironment), nullable=False, default=ClimbingEnvironment.GYM)

    session = relationship("Session", back_populates="routes")