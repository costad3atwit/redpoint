from collections import Counter


def normalize(value):
    if hasattr(value, "value"):
        return value.value
    return value.lower().strip()


def recommend_training(route_attempts, recent_routes_count=10):
    recent_attempts = sorted(
        route_attempts,
        key=lambda a: a.session.date,
        reverse=True
    )[:recent_routes_count]

    if not recent_attempts:
        return {
            "recommended_training": None,
            "recommendation": "Not enough data to provide a training recommendation. Keep climbing!"
        }

    hold_type_options = ["crimp", "pinch", "sloper", "pocket", "jug", "sidepull"]
    style_options = ["bouldering", "sport climbing", "top rope", "traditional climbing"]
    wall_style_options = ["overhang", "slab", "vertical"]
    environment_options = ["gym", "outdoor", "other"]
    send_type_options = ["send", "flash", "day flash", "onsight", "redpoint"]

    categories = {
        "hold_type": hold_type_options,
        "style": style_options,
        "wall_style": wall_style_options,
        "environment": environment_options,
        "send_type": send_type_options,
    }

    counters = {category: Counter() for category in categories}

    for attempt in recent_attempts:
        route = attempt.route
        if route:
            if route.hold_type:
                ht = normalize(route.hold_type)
                if ht in hold_type_options:
                    counters["hold_type"][ht] += 1

            if route.style:
                st = normalize(route.style)
                if st in style_options:
                    counters["style"][st] += 1

            if route.wall_style:
                ws = normalize(route.wall_style)
                if ws in wall_style_options:
                    counters["wall_style"][ws] += 1

            if route.environment:
                env = normalize(route.environment)
                if env in environment_options:
                    counters["environment"][env] += 1

        if attempt.send_type:
            stype = normalize(attempt.send_type)
            if stype in send_type_options:
                counters["send_type"][stype] += 1

    category_counts = {
        category: {option: counters[category].get(option, 0) for option in options}
        for category, options in categories.items()
    }

    recommendations = {}
    for category, counts in category_counts.items():
        if any(counts.values()):
            recommendations[category] = min(counts, key=counts.get)

    focus = recommendations.get("hold_type", "crimp")

    return {
        "reccomended_training": focus,
        "recommendations": recommendations,
        "category_counts": category_counts,
        "recommendation": f"Based on your recent climbs you should focus on {focus}"
    }
