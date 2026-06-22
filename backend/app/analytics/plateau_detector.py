from app.models.routes import ClimbingStyle

def boulder_grade_to_int(grade:str):
    grade_mapping = {
        "V0": 0,
        "V1": 1,
        "V2": 2,
        "V3": 3,
        "V4": 4,
        "V5": 5,
        "V6": 6,
        "V7": 7,
        "V8": 8,
        "V9": 9,
        "V10": 10,
        "V11": 11,
        "V12": 12,
        "V13": 13,
        "V14": 14,
        "V15": 15,
        "V16": 16,
        "V17": 17,
    }

    if not grade:
        return None

    return grade_mapping.get(grade)

def rope_grade_to_int(grade: str):
    grade_mapping = {
        "5.1": 1,
        "5.2": 2,
        "5.3": 3,
        "5.4": 4,
        "5.5": 5,
        "5.6": 6,
        "5.7": 7,
        "5.8": 8,
        "5.9": 9,
        "5.10a": 10,
        "5.10b": 11,
        "5.10c": 12,
        "5.10d": 13,
        "5.11a": 14,
        "5.11b": 15,
        "5.11c": 16,
        "5.11d": 17,
        "5.12a": 18,
        "5.12b": 19,
        "5.12c": 20,
        "5.12d": 21,
        "5.13a": 22,
        "5.13b": 23,
        "5.13c": 24,
        "5.13d": 25,
        "5.14a": 26,
        "5.14b": 27,
        "5.14c": 28,
        "5.14d": 29,
        "5.15a": 30,
        "5.15b": 31,
        "5.15c": 32,
        "5.15d": 33,
    }

    if not grade:
        return None

    return grade_mapping.get(grade)

def detect_plateau_single(route_attempts, grade_converter, recent_routes=5):
    sent_attempts = []

    for attempt in route_attempts:
        if not(attempt.sent and attempt.route and attempt.route.grade and attempt.session):
            continue

        grade_value = grade_converter(attempt.route.grade)

        if grade_value is None:
            continue

        sent_attempts.append((attempt, grade_value))

    if len(sent_attempts) < recent_routes * 2:
        return {
            "plateau_detected": False,
            "recent_average_grade": 0,
            "previous_average_grade": 0,
            "improvement": 0,
            "message": "Not enough data to determine plateau. Keep climbing!",
            "insufficient_data": True
        }

    sent_attempts = sorted(sent_attempts, key=lambda item: item[0].session.date, reverse=True)

    grade_values = [grade_value for _, grade_value in sent_attempts]

    recent_grades = grade_values[:recent_routes]
    previous_grades = grade_values[recent_routes:recent_routes * 2]

    recent_avg = sum(recent_grades) / len(recent_grades)
    previous_avg = sum(previous_grades) / len(previous_grades)

    improvement = recent_avg - previous_avg
    plateau_detected = improvement <= 0

    return {
        "plateau_detected": plateau_detected,
        "recent_average_grade": round(recent_avg, 2),
        "previous_average_grade": round(previous_avg, 2),
        "improvement": round(improvement, 2),
        "message": ("No improvement detected. Keep climbing!" if plateau_detected else "Great job you're improving!"),
        "insufficient_data": False
    }

def detect_plateau(route_attempts):
    rope_attempts = [attempt for attempt in route_attempts if attempt.route and attempt.route.style in {ClimbingStyle.TOP_ROPE, ClimbingStyle.SPORT_CLIMBING, ClimbingStyle.TRADITIONAL_CLIMBING}]

    boulder_attempts = [attempt for attempt in route_attempts if attempt.route and attempt.route.style == ClimbingStyle.BOULDERING]

    boulder_plateau = detect_plateau_single(boulder_attempts, boulder_grade_to_int, recent_routes=5)

    rope_plateau = detect_plateau_single(rope_attempts, rope_grade_to_int, recent_routes=5)

    return {
        "boulder_plateau_detected": boulder_plateau["plateau_detected"],
        "boulder_recent_average_grade": boulder_plateau["recent_average_grade"],
        "boulder_previous_average_grade": boulder_plateau["previous_average_grade"],
        "boulder_improvement": boulder_plateau["improvement"],
        "boulder_message": boulder_plateau["message"],
        "boulder_insufficient_data": boulder_plateau["insufficient_data"],

        "rope_plateau_detected": rope_plateau["plateau_detected"],
        "rope_recent_average_grade": rope_plateau["recent_average_grade"],
        "rope_previous_average_grade": rope_plateau["previous_average_grade"],
        "rope_improvement": rope_plateau["improvement"],
        "rope_message": rope_plateau["message"],
        "rope_insufficient_data": rope_plateau["insufficient_data"],
    }