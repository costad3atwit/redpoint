
def grade_to_int(grade:str):
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
        return 0

    return grade_mapping.get(grade.upper().strip(), 0)

def detect_plateau(routes, recent_routes=5):
    sent_routes = [route for route in routes if route.sent and route.grade and route.session]

    if len(sent_routes) < recent_routes*2:
        return{
            "plateau_detected": False,
            "message": "Not enough data to determine plateau. Keep climbing!"
        }
    
    sent_routes = sorted(sent_routes, key=lambda route: route.session.date, reverse=True)

    grade_values = [grade_to_int(route.grade) for route in sent_routes]

    recent_grades = grade_values[:recent_routes]
    previous_grades = grade_values[recent_routes:recent_routes*2]

    recent_avg = sum(recent_grades) / len(recent_grades)
    previous_avg = sum(previous_grades) / len(previous_grades)

    improvement = recent_avg - previous_avg
    plateau_detected = improvement <= 0

    return {
        "plateau_detected": plateau_detected,
        "recent_average_grade": round(recent_avg, 2),
        "previous_average_grade": round(previous_avg, 2),
        "improvement": round(improvement, 2),
        "message": ("No improvement detected. Keep climbing!" if plateau_detected else "Great job you're improving!")
    }
    