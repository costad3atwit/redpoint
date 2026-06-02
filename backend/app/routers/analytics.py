from fastapi import APIRouter

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/acwr")
def acwr():
    return {"status": "ok"}

@router.get("/plateau_detector")
def plateau_detector():
    return {"status": "ok"}

@router.get("/training_recommender")
def training_recommender():
    return {"status": "ok"}

