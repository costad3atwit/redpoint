from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from app.models.routes import ClimbingEnvironment

#user schemas
class userCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class userResponse(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class userProfileResponse(userResponse):
    sessions_logged: int

class UserStatsResponse(BaseModel):
    total_sessions: int
    total_routes_sent: int
    top_grade_sent: str

class UpdateEmailRequest(BaseModel):
    email: EmailStr
    current_password: str

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str

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
    description: Optional[str] = None
    environment: ClimbingEnvironment = ClimbingEnvironment.GYM

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