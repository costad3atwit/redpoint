from datetime import timedelta

def calculate_acwr(sessions, today):
    training_loads = {}

    for session in sessions:
        session_date = session.date
        session_load = session.rpe * session.duration_minutes
        training_loads[session_date] = (training_loads.get(session_date, 0) + session_load)

    acute_load = sum(training_loads.get(today - timedelta(days=i), 0) for i in range(7))

    chronic_total = sum(training_loads.get(today - timedelta(days=i), 0) for i in range(28))

    chronic_load = chronic_total / 28

    if chronic_load == 0:
        return {
            "acute_load": acute_load,
            "chronic_load": 0,
            "acwr_ratio": 0,
            "overtraining_risk": False,
        }

    acwr_ratio = acute_load / chronic_load

    return {
        "acute_load": acute_load,
        "chronic_load": round(chronic_load, 2),
        "acwr_ratio": round(acwr_ratio, 2),
        "overtraining_risk": acwr_ratio > 1.5,
    }