from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.schema import userCreate, userResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(
    tags=["Authentication"],
)

# 1. Registration Endpoint (Hashes incoming plain text passwords)
@router.post("/register", response_model=userResponse)
def register_user(user_data: userCreate):
    hashed = hash_password(user_data.password)
    
    # MOCK RESPONSE: Replace this with your actual database INSERT query next
    mock_db_user = {
        "id": 1,
        "email": user_data.email,
        "created_at": "2026-05-31T00:00:00"
    }
    return mock_db_user

# 2. Login Endpoint (Verifies user credentials and generates bearer tokens)
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # MOCK LOOKUP: Replace this with your actual database user check next
    if form_data.username != "test@climb.com" or form_data.password != "password123":
        raise HTTPException(status_code=400, detail="Invalid Credentials")
        
    access_token = create_access_token(data={"user_id": 1})
    return {"access_token": access_token, "token_type": "bearer"}