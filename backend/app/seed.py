import argparse
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.users import User
from app.models.sessions import Session as TrainingSession
from app.models.routes import Route, ClimbingEnvironment, ClimbingStyle, HoldType, WallStyle, SendType
from app.models.attempts import RouteAttempt
from app.models.friends import FriendRequest
from app.routers.users import PROFILE_ICONS
from app.auth import hash_password

PROFILE_ICON_CHOICES = sorted(PROFILE_ICONS)

DISCIPLINE_STYLE_MAP = {
    "Bouldering": ClimbingStyle.BOULDERING,
    "Sport Climbing": ClimbingStyle.SPORT_CLIMBING,
    "Top Rope": ClimbingStyle.TOP_ROPE,
    "Trad": ClimbingStyle.TRADITIONAL_CLIMBING
}

HOLD_TYPE_OPTIONS = [HoldType.CRIMP, HoldType.PINCH, HoldType.SLOPER, HoldType.POCKET, HoldType.JUG, HoldType.SIDEPULL]
WALL_STYLE_OPTIONS = [WallStyle.OVERHANG, WallStyle.VERTICAL, WallStyle.SLAB]

FALL_NOTES = [
    "Slipped off start.",
    "Pumped out at crux.",
    "Blew the deadpoint.",
    "Dry-fired off sloper.",
    "Foot popped on chip.",
    "Missed the dynamic latch.",
    "Lost core tension.",
    "Couldn't match finish.",
    "Grip failed near top.",
    "Slipped off volume."
]

HIGH_INTENSITY_NOTES = ["High intensity", "Limit project day", "Max effort burn"]
MODERATE_VOLUME_NOTES = ["Great flow", "Moderate volume", "Steady pacing"]
RECOVERY_REST_NOTES = ["Low intensity", "Active recovery", "Light deload"]


def clean_database(db: DBSession):
    print("Purging old table records cascading down...")
    db.query(RouteAttempt).delete()
    db.query(Route).delete()
    db.query(TrainingSession).delete()
    db.query(FriendRequest).delete()
    db.query(User).delete()
    db.commit()


def _grade_label(discipline: str, min_v: int, max_v: int) -> str:
    grade = random.randint(min_v, max_v)
    return f"V{grade}" if discipline == "Bouldering" else f"5.{grade}"


def _grade_range(discipline: str, user_tier: str, timeline_progress: float) -> tuple[int, int]:
    if discipline == "Bouldering":
        if user_tier == "beginner":
            return int(0 + (2 * timeline_progress)), int(2 + (2 * timeline_progress))
        elif user_tier == "intermediate":
            return int(2 + (2 * timeline_progress)), int(5 + (3 * timeline_progress))
        else:
            return int(6 + (3 * timeline_progress)), int(9 + (4 * timeline_progress))
    else:
        if user_tier == "beginner":
            return int(5 + (2 * timeline_progress)), int(7 + (2 * timeline_progress))
        elif user_tier == "intermediate":
            return int(8 + (1 * timeline_progress)), int(10 + (2 * timeline_progress))
        else:
            return int(11 + (1 * timeline_progress)), int(13 + (1 * timeline_progress))


def generate_perfect_climbing_data(num_users: int, months: int):
    db = next(get_db())
    try:
        clean_database(db)

        total_days = months * 30
        print(f"Seeding {months} months of climbing data for {num_users} users ...")

        shared_password_hash = hash_password("password123")
        end_date = datetime.now(timezone.utc).date()
        seeded_users: list[User] = []

        for i in range(num_users):
            username = f"{i + 1}_climber_profile"
            user_tier = random.choices(["beginner", "intermediate", "advanced"], weights=[0.30, 0.55, 0.15])[0]
            preferred_discipline = random.choices(list(DISCIPLINE_STYLE_MAP.keys()), weights=[0.50, 0.25, 0.20, 0.05])[0]

            user = User(
                username=username,
                email=f"{username}@wit.edu",
                hashed_password=shared_password_hash,
                profile_icon=random.choice(PROFILE_ICON_CHOICES),
                created_at=datetime.now(timezone.utc) - timedelta(days=total_days)
            )
            db.add(user)
            db.flush()
            seeded_users.append(user)

            session_dates = []
            current_sim_date = end_date - timedelta(days=total_days)

            while current_sim_date < end_date:
                current_sim_date += timedelta(days=random.choice([1, 2, 3]))

                if (current_sim_date) >= end_date:
                    break
            
                session_dates.append(current_sim_date)

            session_dates = sorted(session_dates)
            num_sessions = len(session_dates)
            
            # Route library: routes the user has registered, independent of sessions.
            # Grows over time; unsent routes are tracked separately as "projects."
            route_library: list[Route] = []
            unsent_routes: list[Route] = []

            for session_index, s_date in enumerate(session_dates):
                session_time = datetime.combine(s_date, datetime.min.time())
                timeline_progress = (session_index + 1) / len(session_dates)
                min_v, max_v = _grade_range(preferred_discipline, user_tier, timeline_progress)

                session_rpe = random.randint(5, 10)
                session_finger_load = random.randint(3, 9)

                if session_rpe >= 9 or session_finger_load >= 8:
                    session_notes = random.choice(HIGH_INTENSITY_NOTES)
                elif session_rpe <= 6 and session_finger_load <= 5:
                    session_notes = random.choice(RECOVERY_REST_NOTES)
                else:
                    session_notes = random.choice(MODERATE_VOLUME_NOTES)

                session = TrainingSession(
                    user_id=user.id,
                    date=session_time,
                    duration_minutes=random.choice([60, 90, 120]) if preferred_discipline == "Bouldering" else random.choice([120, 180, 240]),
                    rpe=session_rpe,
                    finger_load_rating=session_finger_load,
                    notes=session_notes
                )
                db.add(session)
                db.flush()

                # New routes registered this session (added to the library).
                if preferred_discipline == "Bouldering":
                    num_new = random.randint(3, 6)
                elif preferred_discipline == "Top Rope":
                    num_new = random.randint(2, 4)
                else:
                    num_new = random.randint(1, 3)

                new_routes: list[Route] = []
                for r_idx in range(num_new):
                    chosen_wall_style = random.choice(WALL_STYLE_OPTIONS)
                    chosen_hold_type = random.choice(HOLD_TYPE_OPTIONS)
                    grade = _grade_label(preferred_discipline, min_v, max_v)

                    route = Route(
                        user_id=user.id,
                        name=f"Line {grade}",
                        description=f"Generated mock route simulation sequence #{r_idx + 1}.",
                        grade=grade,
                        environment=random.choices(
                            [ClimbingEnvironment.GYM, ClimbingEnvironment.OUTDOOR, ClimbingEnvironment.OTHER],
                            weights=[0.75, 0.20, 0.05]
                        )[0],
                        hold_type=[chosen_hold_type],
                        style=DISCIPLINE_STYLE_MAP[preferred_discipline],
                        wall_style=chosen_wall_style
                    )
                    db.add(route)
                    db.flush()
                    new_routes.append(route)
                    route_library.append(route)

                # Re-attempts: pull projects (unsent routes) from the existing library.
                # This is the key cross-session behavior enabled by the new schema.
                num_repeats = min(random.randint(0, 3), len(unsent_routes))
                repeat_routes = random.sample(unsent_routes, k=num_repeats) if num_repeats > 0 else []

                routes_this_session = new_routes + repeat_routes

                for r_idx, route in enumerate(routes_this_session):
                    is_repeat = route in repeat_routes
                    # Projects get a modest bump in send probability — the climber has worked it before.
                    base_send_prob = 0.75 if r_idx < 4 else 0.40
                    send_prob = min(base_send_prob + 0.20, 0.92) if is_repeat else base_send_prob

                    is_sent = random.random() < send_prob
                    total_burns = (
                        random.choices([1, 2, 3, 4, 5], weights=[0.35, 0.35, 0.15, 0.10, 0.05])[0]
                        if is_sent else random.randint(2, 6)
                    )

                    if is_sent:
                        if total_burns == 1:
                            send_type_choice = random.choice([SendType.FLASH, SendType.DAY_FLASH, SendType.ONSIGHT, SendType.SEND])
                            notes_str = f"First burn {send_type_choice.value}."
                        else:
                            send_type_choice = SendType.REDPOINT if total_burns >= 4 else SendType.SEND
                            notes_str = f"Sent on try #{total_burns}."
                        if route in unsent_routes:
                            unsent_routes.remove(route)
                    else:
                        send_type_choice = None
                        notes_str = f"Fell at crux: {random.choice(FALL_NOTES)}"
                        if route not in unsent_routes:
                            unsent_routes.append(route)

                    attempt_record = RouteAttempt(
                        session_id=session.id,
                        route_id=route.id,
                        sent=is_sent,
                        send_type=send_type_choice.value if send_type_choice else None,
                        attempts=total_burns,
                        route_length=random.choice([10, 12, 15, None] if preferred_discipline != "Bouldering" else [None]),
                        notes=notes_str
                    )
                    db.add(attempt_record)

        # Friendships: each user befriends a handful of others so the friend
        # feed has data out of the box.
        friend_pairs: set[tuple[uuid.UUID, uuid.UUID]] = set()
        for user in seeded_users:
            others = [u for u in seeded_users if u.id != user.id]
            for friend in random.sample(others, k=min(random.randint(3, 5), len(others))):
                pair = tuple(sorted((user.id, friend.id)))
                if pair in friend_pairs:
                    continue
                friend_pairs.add(pair)
                db.add(FriendRequest(
                    sender_id=user.id,
                    receiver_id=friend.id,
                    status="accepted"
                ))

        db.commit()
        print(f"\nSUCCESS: Seeding complete. {num_users} users seeded over {months} months of progression, {len(friend_pairs)} friendships created.")
    except Exception as e:
        db.rollback()
        print(f"Error during execution: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synchronous analytical seed manager.")
    parser.add_argument("-u", "--users", type=int, default=15, help="Number of dense profiles to build.")
    parser.add_argument("-m", "--months", type=int, default=3, help="Number of months back to generate data")
    args = parser.parse_args()
    generate_perfect_climbing_data(num_users=args.users, months=args.months)