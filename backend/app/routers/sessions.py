from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession, selectinload

from app.database import get_db
from app.models.sessions import Session as TrainingSession
from app.models.attempts import RouteAttempt
from app.schemas.schema import sessionCreate, sessionResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

def _load_attempts(q):
    return q.options(
        selectinload(TrainingSession.route_attempts).selectinload(RouteAttempt.route)
    )

@router.post("/", response_model=sessionResponse)
def create_session(session_data: sessionCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    data = session_data.model_dump(exclude_none=True)
    session = TrainingSession(user_id=current_user["user_id"], **data)
    db.add(session)
    db.commit()
    db.refresh(session)
    session = _load_attempts(
        db.query(TrainingSession).filter(TrainingSession.id == session.id)
    ).first()
    return session

@router.get("/", response_model=list[sessionResponse])
def get_sessions(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    return _load_attempts(
        db.query(TrainingSession).filter(TrainingSession.user_id == current_user["user_id"])
    ).order_by(TrainingSession.date.desc()).all()

@router.get("/{session_id}", response_model=sessionResponse)
def get_session(session_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    session = _load_attempts(
        db.query(TrainingSession).filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user["user_id"],
        )
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/{session_id}", response_model=sessionResponse)
def update_session(session_id: UUID, session_data: sessionCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    session = db.query(TrainingSession).filter(
        TrainingSession.id == session_id,
        TrainingSession.user_id == current_user["user_id"],
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for key, value in session_data.model_dump(exclude_none=True).items():
        setattr(session, key, value)
    db.commit()
    session = _load_attempts(
        db.query(TrainingSession).filter(TrainingSession.id == session_id)
    ).first()
    return session

@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    session = db.query(TrainingSession).filter(
        TrainingSession.id == session_id,
        TrainingSession.user_id == current_user["user_id"],
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
