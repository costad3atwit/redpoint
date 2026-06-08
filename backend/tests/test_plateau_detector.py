from datetime import date, timedelta
from types import SimpleNamespace

from app.analytics.plateau_detector import detect_plateau

today = date.today()

routes = []

for i in range(5):
    routes.append(
        SimpleNamespace(
            grade="V5",
            sent=True,
            session=SimpleNamespace(
                date=today - timedelta(days=i)
            )
        )
    )

for i in range(5, 10):
    routes.append(
        SimpleNamespace(
            grade="V7",
            sent=True,
            session=SimpleNamespace(
                date=today - timedelta(days=i)
            )
        )
    )

print(detect_plateau(routes))