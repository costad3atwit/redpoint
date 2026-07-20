from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession, selectinload
from datetime import date

from app.database import get_db
from app.auth import get_current_user
from app.models.attempts import RouteAttempt
from app.models.sessions import Session as TrainingSession

from app.analytics.plateau_detector import detect_plateau
from app.analytics.acwr import calculate_acwr
from app.analytics.training_recommender import recommend_training

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


def _load_attempts_with_context(db: DBSession, user_id: str):
    return (
        db.query(RouteAttempt)
        .join(TrainingSession)
        .options(
            selectinload(RouteAttempt.route),
            selectinload(RouteAttempt.session),
        )
        .filter(TrainingSession.user_id == user_id)
        .all()
    )


@router.get("/acwr")
def get_acwr(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    sessions = (
        db.query(TrainingSession)
        .filter(TrainingSession.user_id == current_user["user_id"])
        .all()
    )
    return calculate_acwr(sessions, date.today())


@router.get("/plateau")
def get_plateau_detector(
    db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    attempts = _load_attempts_with_context(db, current_user["user_id"])
    return detect_plateau(attempts)


@router.get("/training")
def get_training_recommender(
    db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    attempts = _load_attempts_with_context(db, current_user["user_id"])
    return recommend_training(attempts)
