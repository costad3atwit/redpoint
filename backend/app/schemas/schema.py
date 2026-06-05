from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID

#user schemas
class userCreate(BaseModel):
    email: EmailStr
    password: str

class userResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

#session schemas
class sessionCreate(BaseModel):
    duration_minutes: int
    rpe: int
    finger_load_rating: int
    notes: Optional[str] = None

class sessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    date: datetime
    duration_minutes: int
    rpe: int
    finger_load_rating: int
    notes: Optional[str] = None
    class Config:
        from_attributes = True

#route schemas
class routeCreate(BaseModel):
    grade: str
    wall_angle: Optional[str] = None
    sent: bool = False
    send_type: Optional[str] = None
    attempts: Optional[int] = None
    style_tags: Optional[List[str]] = None

class routeResponse(routeCreate):
    id: UUID
    session_id: UUID
    class Config:
        from_attributes = True
    
#attempt schemas
class attemptCreate(BaseModel):
    success: bool = False
    notes: Optional[str] = None

class attemptResponse(attemptCreate):
    id: UUID
    route_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True