from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.sessions import Session as TrainingSession
from app.schemas.schema import sessionCreate, sessionResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

#Create
@router.post("/", response_model=sessionResponse)
def create_session(session_data: sessionCreate, db: DBSession = Depends(get_db), current_user = Depends(get_current_user)):
    session = TrainingSession(user_id=current_user["user_id"], **session_data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

#Read
@router.get("/", response_model=list[sessionResponse])
def get_sessions(db: DBSession = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(TrainingSession).filter(TrainingSession.user_id == current_user["user_id"]).all()

#Read single session
@router.get("/{session_id}", response_model=sessionResponse)
def get_session(session_id: UUID, db: DBSession = Depends(get_db), current_user = Depends(get_current_user)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id, TrainingSession.user_id == current_user["user_id"]).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

#Update
@router.put("/{session_id}", response_model=sessionResponse)
def update_session(session_id: UUID, session_data: sessionCreate, db: DBSession = Depends(get_db), current_user = Depends(get_current_user)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id, TrainingSession.user_id == current_user["user_id"]).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for key, value in session_data.model_dump().items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session

#Delete
@router.delete("/{session_id}")
def delete_session(session_id: UUID, db: DBSession = Depends(get_db), current_user = Depends(get_current_user)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id, TrainingSession.user_id == current_user["user_id"]).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()

    return {"message": f"Deleted session with ID {session_id}"}