import uuid
<<<<<<< Updated upstream
import enum
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, ARRAY, Enum
from sqlalchemy.dialects.postgresql import UUID
=======
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
>>>>>>> Stashed changes
from sqlalchemy.orm import relationship
from app.database import Base

class ClimbingEnvironment(str, enum.Enum):
    GYM = "gym"
    OUTDOOR = "outdoor"
    OTHER = 'other'

class ClimbingStyle(str, enum.Enum):
    BOULDERING = "bouldering"
    SPORT_CLIMBING = "sport climbing"
    TOP_ROPE = "top rope"
    TRADITIONAL_CLIMBING = "traditional climbing"

class HoldType(str, enum.Enum):
    CRIMP = "crimp"
    PINCH = "pinch"
    SLOPER = "sloper"
    POCKET = "pocket"
    JUG = "jug"
    SIDEPULL = "sidepull"

class WallStyle(str, enum.Enum):
    OVERHANG = "overhang"
    VERRTICAL = "vertical"
    SLAB = "slab"

class SendType(str, enum.Enum):
    SEND = "send"
    FLASH = "flash"
    DAY_FLASH = "day flash"
    ONSIGHT = "onsight"
    REDPOINT = "redpoint"

class Route(Base):
    __tablename__ = "routes"

<<<<<<< Updated upstream
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4 ,index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String, nullable=False) 
    hold_type = Column(Enum(HoldType), nullable=True)
    style = Column(Enum(ClimbingStyle), nullable=True)
    wall_style = Column(Enum(WallStyle),nullable=True)
    wall_angle = Column(String, nullable=True) 
    sent = Column(Boolean, default=False)
    send_type = Column(String, nullable=True) 
    attempts = Column(Integer, default=1)
=======
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    grade = Column(String, nullable=False)
    wall_angle = Column(String, nullable=True)
>>>>>>> Stashed changes
    style_tags = Column(ARRAY(String), nullable=True)
    description = Column(String, nullable=True)
    environment = Column(Enum(ClimbingEnvironment), nullable=False, default=ClimbingEnvironment.GYM)

    user = relationship("User", back_populates="routes")
    attempts = relationship("RouteAttempt", back_populates="route", cascade="all, delete-orphan")