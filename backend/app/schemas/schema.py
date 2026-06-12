from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from app.models.routes import ClimbingEnvironment  # noqa: F401 — used in routeCreate

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
    environment: Optional[ClimbingEnvironment] = ClimbingEnvironment.GYM

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
