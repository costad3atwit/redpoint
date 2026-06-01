from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.sessions import Session as TrainingSession
from app.schemas.schema import sessionCreate, sessionResponse

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

#Create
@router.post("/", response_model=sessionResponse)
def create_session(session_data: sessionCreate, db: DBSession = Depends(get_db)):
    session = TrainingSession(user_id=1, **session_data.model_dump()) #user id is temp until i figure out auth
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

#Read
@router.get("/", response_model=list[sessionResponse])
def get_sessions(db: DBSession = Depends(get_db)):
    return db.query(TrainingSession).all()

#Read single session
@router.get("/{session_id}", response_model=sessionResponse)
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

#Update
@router.put("/{session_id}", response_model=sessionResponse)
def update_session(session_id: int, session_data: sessionCreate, db: DBSession = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for key, value in session_data.model_dump().items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session

#Delete
@router.delete("/{session_id}")
def delete_session(session_id: int, db: DBSession = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()

    return {"message": f"Deleted session with ID {session_id}"}