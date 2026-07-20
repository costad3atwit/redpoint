from datetime import date, datetime, timedelta


def _to_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return value


def calculate_acwr(sessions, today=None):
    if today is None:
        today = date.today()
    else:
        today = _to_date(today)

    training_loads = {}
    session_dates = []

    for session in sessions:
        session_date = _to_date(session.date)

        if session_date is None:
            continue

        session_dates.append(session_date)
        session_load = session.rpe * session.duration_minutes
        training_loads[session_date] = (
            training_loads.get(session_date, 0) + session_load
        )

    oldest_session_date = min(session_dates) if session_dates else None
    insufficient_data = (
        oldest_session_date is None or (today - oldest_session_date).days < 28
    )

    acute_total = sum(
        training_loads.get(today - timedelta(days=i), 0) for i in range(7)
    )
    chronic_total = sum(
        training_loads.get(today - timedelta(days=i), 0) for i in range(28)
    )

    acute_load = acute_total / 7
    chronic_load = chronic_total / 28

    if chronic_load == 0:
        return {
            "acute_load": round(acute_load, 2),
            "chronic_load": 0,
            "acwr_ratio": 0,
            "overtraining_risk": False,
            "insufficient_data": insufficient_data,
        }

    acwr_ratio = acute_load / chronic_load

    return {
        "acute_load": round(acute_load, 2),
        "chronic_load": round(chronic_load, 2),
        "acwr_ratio": round(acwr_ratio, 2),
        "overtraining_risk": acwr_ratio > 1.5,
        "insufficient_data": insufficient_data,
    }
