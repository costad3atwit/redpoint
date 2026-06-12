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

    top_grade_sent = "—"
    if sent_attempts:
        def grade_key(g: str) -> int:
            g = g.strip().upper()
            if g.startswith("V"):
                try:
                    return int(g[1:])
                except ValueError:
                    pass
            return -1
        top_grade_sent = max((a.route.grade for a in sent_attempts), key=grade_key)

    return {
        "total_sessions": total_sessions,
        "total_routes_sent": len(sent_attempts),
        "top_grade_sent": top_grade_sent,
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