from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.users import User
from app.models.sessions import Session as TrainingSession
from app.models.attempts import RouteAttempt
from app.models.routes import Route
from app.schemas.schema import (
    userCreate, userResponse,
    UserStatsResponse, UpdateEmailRequest, UpdatePasswordRequest,
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(
    tags=["Authentication"],
)

@router.post("/register", response_model=userResponse)
def register_user(user_data: userCreate, db: DBSession = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: DBSession = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Credentials")

    access_token = create_access_token({"user_id": str(user.id), "username": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@router.get("/users/me", response_model=userResponse)
def get_me(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/me/stats", response_model=UserStatsResponse)
def get_me_stats(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    total_sessions = db.query(TrainingSession).filter(TrainingSession.user_id == user_id).count()

    sent_attempts = (
        db.query(RouteAttempt)
        .join(TrainingSession)
        .join(Route)
        .filter(TrainingSession.user_id == user_id, RouteAttempt.sent == True)
        .all()
    )

    _YDS_ORDER = [
        "5.1","5.2","5.3","5.4","5.5","5.6","5.7","5.8","5.9",
        "5.10a","5.10b","5.10c","5.10d",
        "5.11a","5.11b","5.11c","5.11d",
        "5.12a","5.12b","5.12c","5.12d",
        "5.13a","5.13b","5.13c","5.13d",
        "5.14a","5.14b","5.14c","5.14d",
        "5.15a","5.15b","5.15c","5.15d",
    ]

    def _v_key(g: str) -> int:
        g = g.strip().upper()
        if g == "VB":
            return -1
        if g.startswith("V"):
            try:
                return int(g[1:])
            except ValueError:
                pass
        return -999

    def _yds_key(g: str) -> int:
        g = g.strip().lower()
        try:
            return _YDS_ORDER.index(g)
        except ValueError:
            for i, yg in enumerate(_YDS_ORDER):
                if yg.startswith(g):
                    return i
            return -1

    boulder_grades = [a.route.grade for a in sent_attempts if a.route.grade.strip().upper().startswith("V")]
    roped_grades = [a.route.grade for a in sent_attempts if not a.route.grade.strip().upper().startswith("V")]

    top_boulder_grade = max(boulder_grades, key=_v_key) if boulder_grades else "—"
    top_roped_grade = max(roped_grades, key=_yds_key) if roped_grades else "—"

    return {
        "total_sessions": total_sessions,
        "total_routes_sent": len(sent_attempts),
        "top_boulder_grade": top_boulder_grade,
        "top_roped_grade": top_roped_grade,
    }

@router.patch("/users/me/email", response_model=userResponse)
def update_email(body: UpdateEmailRequest, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user or not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")
    if db.query(User).filter(User.email == body.email, User.id != user.id).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    user.email = body.email
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(body: UpdatePasswordRequest, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user or not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")
    user.hashed_password = hash_password(body.new_password)
    db.commit()

@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()