from datetime import date, timedelta
from types import SimpleNamespace

from app.analytics.training_recommender import recommend_training

today = date.today()

routes = [
    SimpleNamespace(
        style_tags=["crimp"],
        session=SimpleNamespace(date=today)
    ),
    SimpleNamespace(
        style_tags=["crimp"],
        session=SimpleNamespace(date=today - timedelta(days=1))
    ),
    SimpleNamespace(
        style_tags=["overhang"],
        session=SimpleNamespace(date=today - timedelta(days=2))
    ),
]

print(recommend_training(routes))