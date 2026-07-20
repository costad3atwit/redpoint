from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession, selectinload

from app.database import get_db
from app.models.attempts import RouteAttempt
from app.models.sessions import Session as TrainingSession
from app.schemas.schema import routeAttemptCreate, routeAttemptResponse
from app.auth import get_current_user

router = APIRouter(tags=["route_attempts"])


@router.post("/sessions/{session_id}/attempts", response_model=routeAttemptResponse)
def create_attempt(
    session_id: UUID,
    attempt_data: routeAttemptCreate,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user["user_id"],
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    attempt = RouteAttempt(session_id=session_id, **attempt_data.model_dump())
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    attempt = (
        db.query(RouteAttempt)
        .options(selectinload(RouteAttempt.route))
        .filter(RouteAttempt.id == attempt.id)
        .first()
    )
    return attempt


@router.get(
    "/sessions/{session_id}/attempts", response_model=list[routeAttemptResponse]
)
def get_attempts(
    session_id: UUID,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    session = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == current_user["user_id"],
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return (
        db.query(RouteAttempt)
        .options(selectinload(RouteAttempt.route))
        .filter(RouteAttempt.session_id == session_id)
        .all()
    )


@router.put("/attempts/{attempt_id}", response_model=routeAttemptResponse)
def update_attempt(
    attempt_id: UUID,
    attempt_data: routeAttemptCreate,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    attempt = (
        db.query(RouteAttempt)
        .join(TrainingSession)
        .filter(
            RouteAttempt.id == attempt_id,
            TrainingSession.user_id == current_user["user_id"],
        )
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    for key, value in attempt_data.model_dump().items():
        setattr(attempt, key, value)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.delete("/attempts/{attempt_id}", status_code=204)
def delete_attempt(
    attempt_id: UUID,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    attempt = (
        db.query(RouteAttempt)
        .join(TrainingSession)
        .filter(
            RouteAttempt.id == attempt_id,
            TrainingSession.user_id == current_user["user_id"],
        )
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    db.delete(attempt)
    db.commit()
