from collections import Counter

def recommend_training(routes, recent_routes_count=10):
    recent_routes = sorted(routes, key=lambda route: route.session.date, reverse=True)[:recent_routes_count]

    if not recent_routes:
        return {
            "recommended_training": None,
            "recommendation": "Not enough data to provide a training recommendation. Keep climbing!"
        }
    
    hold_types  = [
        "crimp",
        "pinch",
        "sloper",
        "pocket",
        "jug",
        "sidepull"
    ]

    styles = [
        "bouldering",
        "sport climbing",
        "top rope",
        "traditional climbing"
    ]

    wall_styles = [
        "overhang",
        "slab",
        "vertical"
    ]

    environments = [
        "indoor",
        "outdoor",
        "other"
    ]

    send_types = [
        "send",
        "flash",
        "day flash",
        "onsight",
        "redpoint"
    ]

    categories = {
        "hold_type": hold_types,
        "style": styles,
        "wall_style": wall_styles,
        "environment": environments,
        "send_type": send_types
    }

    counters = {category: Counter() for category in categories}

    for route in recent_routes:
        if route.hold_type in hold_types:
            counters["hold_type"][route.hold_type.lower().strip()] += 1

        if route.style in styles:
            counters["style"][route.style.lower().strip()] += 1

        if route.wall_style in wall_styles:
            counters["wall_style"][route.wall_style.lower().strip()] += 1

        if route.environment in environments:
            counters["environment"][route.environment.lower().strip()] += 1

        if route.send_type in send_types:
            counters["send_type"][route.send_type.lower().strip()] += 1

    category_counts = {}

    for category, options in counters.items():
        category_counts[category] = {option: counters[category].get(option, 0) for option in options}

    recommendations = {}

    for category, counts in category_counts.items():
        least_used = min(counts, key=counts.get)

        recommendations[category] = least_used

    focus = recommendations["hold_types"]

    return {
        "reccomended_training": focus,
        "recommendations": recommendations,
        "category_counts": category_counts,
        "recommendation": (f"Based on your recent climbs you should focus on" f"{focus}")
    }