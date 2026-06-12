from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from app.models.routes import ClimbingEnvironment

# ── User ──────────────────────────────────────────────────────────────────────

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

# ── Route (user-owned library) ────────────────────────────────────────────────

class routeCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    grade: str
    wall_angle: Optional[str] = None
    style_tags: Optional[List[str]] = None

class routeResponse(routeCreate):
    id: UUID
    user_id: UUID
    class Config:
        from_attributes = True

# ── RouteAttempt (session entry) ──────────────────────────────────────────────

class routeAttemptCreate(BaseModel):
    route_id: UUID
    sent: bool = False
    send_type: Optional[str] = None
    attempts: Optional[int] = 1
    route_length: Optional[int] = None
    notes: Optional[str] = None

class routeAttemptResponse(BaseModel):
    id: UUID
    session_id: UUID
    route_id: UUID
    route: routeResponse
    sent: bool
    send_type: Optional[str] = None
    attempts: Optional[int] = None
    route_length: Optional[int] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

# ── Session ───────────────────────────────────────────────────────────────────

class sessionCreate(BaseModel):
    date: Optional[datetime] = None
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
    route_attempts: List[routeAttemptResponse] = []
    class Config:
        from_attributes = True
<<<<<<< Updated upstream

#route schemas
class routeCreate(BaseModel):
    grade: str
    wall_angle: Optional[str] = None
    sent: bool = False
    send_type: Optional[str] = None
    attempts: Optional[int] = None
    style_tags: Optional[List[str]] = None
    description: Optional[str] = None
    environment: ClimbingEnvironment = "gym"

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
=======
>>>>>>> Stashed changes
