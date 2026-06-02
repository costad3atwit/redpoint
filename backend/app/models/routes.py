from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String, nullable=False) 
    wall_angle = Column(String, nullable=True) 
    sent = Column(Boolean, default=False)
    send_type = Column(String, nullable=True) 
    attempts = Column(Integer, default=1)
    style_tags = Column(ARRAY(String), nullable=True)

    session = relationship("Session", back_populates="routes")