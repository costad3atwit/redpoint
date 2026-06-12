from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from datetime import date

from app.database import get_db
from app.auth import get_current_user
from app.models.routes import Route
from app.models.sessions import Session as TrainingSession

from app.analytics.plateau_detector import detect_plateau
from app.analytics.acwr import calculate_acwr
from app.analytics.training_recommender import recommend_training

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/acwr")
def get_acwr(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    sessions = (db.query(TrainingSession).filter(TrainingSession.user_id == current_user["user_id"]).all())
    return calculate_acwr(sessions, date.today())

@router.get("/plateau")
def get_plateau_detector(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    routes = (db.query(Route).join(TrainingSession).filter(TrainingSession.user_id == current_user["user_id"]).all())
    return detect_plateau(routes)

@router.get("/training")
def get_training_recommender(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    routes = (db.query(Route).join(TrainingSession).filter(TrainingSession.user_id == current_user["user_id"]).all())
    return recommend_training(routes)

