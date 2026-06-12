from collections import Counter

def normalize(value):
    if hasattr(value, "value"):
        return value.value
    
    return value.lower().strip()

def recommend_training(routes, recent_routes_count=10):
    recent_routes = sorted(routes, key=lambda route: route.session.date, reverse=True)[:recent_routes_count]

    if not recent_routes:
        return {
            "recommended_training": None,
            "recommendation": "Not enough data to provide a training recommendation. Keep climbing!"
        }
    
    hold_type  = [
        "crimp",
        "pinch",
        "sloper",
        "pocket",
        "jug",
        "sidepull"
    ]

    style = [
        "bouldering",
        "sport climbing",
        "top rope",
        "traditional climbing"
    ]

    wall_style = [
        "overhang",
        "slab",
        "vertical"
    ]

    environment = [
        "indoor",
        "outdoor",
        "other"
    ]

    send_type = [
        "send",
        "flash",
        "day flash",
        "onsight",
        "redpoint"
    ]

    categories = {
        "hold_type": hold_type,
        "style": style,
        "wall_style": wall_style,
        "environment": environment,
        "send_type": send_type
    }

    counters = {category: Counter() for category in categories}

    for route in recent_routes:
        if route.hold_type in hold_type:
            counters["hold_type"][route.hold_type.lower().strip()] += 1

        if route.style in style:
            counters["style"][route.style.lower().strip()] += 1

        if route.wall_style in wall_style:
            counters["wall_style"][route.wall_style.lower().strip()] += 1

        if route.environment in environment:
            counters["environment"][route.environment.lower().strip()] += 1

        if route.send_type in send_type:
            counters["send_type"][route.send_type.lower().strip()] += 1

    category_counts = {}

    for category, options in counters.items():
        category_counts[category] = {option: counters[category].get(option, 0) for option in options}

    recommendations = {}

    for category, counts in category_counts.items():
        least_used = min(counts, key=counts.get)

        recommendations[category] = least_used

    focus = recommendations["hold_type"]

    return {
        "reccomended_training": focus,
        "recommendations": recommendations,
        "category_counts": category_counts,
        "recommendation": (f"Based on your recent climbs you should focus on" f"{focus}")
    }