from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

#user schemas
class userCreate(BaseModel):
    email: EmailStr
    password: str

class userResponse(BaseModel):
    id: int
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
    id: int
    user_id: int
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
    id: int
    session_id: int
    class Config:
        from_attributes = True
    
