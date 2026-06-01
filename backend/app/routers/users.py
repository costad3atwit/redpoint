from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.schemas.schema import userCreate, userResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(
    tags=["Authentication"],
)

# 1. Registration Endpoint (Hashes incoming plain text passwords)
@router.post("/register", response_model=userResponse)
def register_user(user_data: userCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# 2. Login Endpoint (Verifies user credentials and generates bearer tokens)
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Credentials")

    access_token = create_access_token({"sub":str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
