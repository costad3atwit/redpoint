import uuid
import enum
from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class ClimbingEnvironment(str, enum.Enum):
    GYM = "gym"
    OUTDOOR = "outdoor"
    OTHER = "other"


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
    VERTICAL = "vertical"
    SLAB = "slab"


class SendType(str, enum.Enum):
    SEND = "send"
    FLASH = "flash"
    DAY_FLASH = "day flash"
    ONSIGHT = "onsight"
    REDPOINT = "redpoint"


class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    grade = Column(String, nullable=False)
    environment = Column(Enum(ClimbingEnvironment), nullable=False, default=ClimbingEnvironment.GYM)
    hold_type = Column(ARRAY(Enum(HoldType)), nullable=True)
    style = Column(Enum(ClimbingStyle), nullable=True)
    wall_style = Column(Enum(WallStyle), nullable=True)

    user = relationship("User", back_populates="routes")
    attempts = relationship("RouteAttempt", back_populates="route", cascade="all, delete-orphan")