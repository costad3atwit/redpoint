from collections import Counter

def recommend_training(routes, recent_routes_count=10):
    recent_routes = sorted(routes, key=lambda route: route.session.date, reverse=True)[:recent_routes_count]

    if not recent_routes:
        return {
            "recommended_training": None,
            "recommendation": "Not enough data to provide a training recommendation. Keep climbing!"
        }
    
    style_counter = Counter()

    for route in recent_routes:
        if route.style_tags:
            for tag in route.style_tags:
                style_counter[tag.lower().strip()] += 1

    if not style_counter:
        return {
            "recommended_training": None,
            "recommendation": "No style tags found in recent routes. Consider adding style tags to your climbs for better recommendations!"
        }
    #TODO - add more styles
    styles = [
        "crimp",
        "sloper",
        "overhang"
    ]

    style_counts = {style: style_counter.get(style, 0) for style in styles}

    recommended_focus = min(style_counts, key=style_counts.get)

    return {
        "recommended_training": recommended_focus,
        "style_counts": dict(style_counter),
        "recommendation": f"Based on your recent climbs, you might want to focus on {recommended_focus} training."
    }
