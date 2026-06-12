import argparse
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.users import User
from app.models.sessions import Session as TrainingSession
from app.models.routes import Route, ClimbingEnvironment
from app.models.attempts import Attempt
from app.auth import hash_password

HOLD_TYPES = ["Crimp", "Pinch", "Sloper", "Pocket", "Jug", "Sidepull"]
DISCIPLINES = ["Bouldering", "Sport Climbing", "Top Rope", "Trad"]
WALL_STYLES = ["Overhang", "Vertical", "Slab"]

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
    db.query(Attempt).delete()
    db.query(Route).delete()
    db.query(TrainingSession).delete()
    db.query(User).delete()
    db.commit()

def generate_perfect_climbing_data(num_users: int):
    db = next(get_db())
    try:
        clean_database(db)
        print(f"Seeding synchronous chronological data for {num_users} users...")

        shared_password_hash = hash_password("password123")
        end_date = datetime.now(timezone.utc).date()

        for i in range(num_users):
            username = f"climber_profile_{i + 1}"
            user_tier = random.choices(["beginner", "intermediate", "advanced"], weights=[0.30, 0.55, 0.15])[0]
            preferred_discipline = random.choices(DISCIPLINES, weights=[0.50, 0.25, 0.20, 0.05])[0]

            user = User(
                username=username,
                email=f"{username}@wentworth.edu",
                hashed_password=shared_password_hash,
                created_at=datetime.now(timezone.utc) - timedelta(days=90)
            )
            db.add(user)
            db.flush()

            num_sessions = random.randint(7, 28)
            session_dates = []
            current_sim_date = end_date - timedelta(days=int(num_sessions * 2.2))
            
            for _ in range(num_sessions):
                current_sim_date += timedelta(days=random.choice([1, 2, 3]))
                if current_sim_date >= end_date:
                    current_sim_date = end_date - timedelta(days=1)
                session_dates.append(current_sim_date)

                if random.random() < 0.05:
                    session_dates.append(current_sim_date)
            
            session_dates = sorted(session_dates)

            for session_index, s_date in enumerate(session_dates):
                session_time = datetime.combine(s_date, datetime.min.time())
                timeline_progress = (session_index + 1) / len(session_dates)

                if preferred_discipline == "Bouldering":
                    min_v = int(0 + (2 * timeline_progress)) if user_tier == "beginner" else (int(2 + (2 * timeline_progress)) if user_tier == "intermediate" else int(6 + (3 * timeline_progress)))
                    max_v = int(2 + (2 * timeline_progress)) if user_tier == "beginner" else (int(5 + (3 * timeline_progress)) if user_tier == "intermediate" else int(9 + (4 * timeline_progress)))
                    num_routes = random.randint(10, 12) 
                else:
                    min_v = int(5 + (2 * timeline_progress)) if user_tier == "beginner" else (int(8 + (1 * timeline_progress)) if user_tier == "intermediate" else int(11 + (1 * timeline_progress)))
                    max_v = int(7 + (2 * timeline_progress)) if user_tier == "beginner" else (int(10 + (2 * timeline_progress)) if user_tier == "intermediate" else int(13 + (1 * timeline_progress)))
                    num_routes = random.randint(5, 7) if preferred_discipline == "Top Rope" else random.randint(3, 5)

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

                for r_idx in range(num_routes):
                    grade_label = f"V{random.randint(min_v, max_v)}" if preferred_discipline == "Bouldering" else f"5.{random.randint(min_v, max_v)}"

                    route = Route(
                        session_id=session.id,
                        grade=grade_label,
                        wall_angle=random.choice(WALL_STYLES),
                        style_tags=random.sample(HOLD_TYPES, k=random.randint(1, 3)),
                        description=f"{preferred_discipline} set line #{r_idx + 1}",
                        environment=random.choices(
                            [ClimbingEnvironment.GYM, ClimbingEnvironment.OUTDOOR, ClimbingEnvironment.OTHER], 
                            weights=[0.75, 0.20, 0.05]
                        )[0]
                    )
                    db.add(route)
                    db.flush()

                    is_sent = random.random() < (0.75 if r_idx < 4 else 0.40)
                    total_burns = random.choices([1, 2, 3, 4, 5], weights=[0.35, 0.35, 0.15, 0.10, 0.05])[0] if is_sent else random.randint(2, 6)

                    for attempt_num in range(1, total_burns + 1):
                        attempt_success = True if (is_sent and attempt_num == total_burns) else False

                        if attempt_success:
                            if total_burns == 1:
                                send_type_choice = random.choice(["Flash", "Day Flash", "Onsight", "Send"])
                                if send_type_choice == "Onsight":
                                    notes_str = "Onsight send!"
                                elif send_type_choice == "Flash":
                                    notes_str = "Flash send!"
                                elif send_type_choice == "Day Flash":
                                    notes_str = "Day Flash send!"
                                else:
                                    notes_str = "First try send."
                            else:
                                send_type_choice = "Redpoint" if total_burns >= 4 else "Send"
                                notes_str = f"Redpoint send on try #{attempt_num}." if send_type_choice == "Redpoint" else f"Sent on try #{attempt_num}."
                        else:
                            send_type_choice = None
                            notes_str = f"Attempt #{attempt_num}: {random.choice(FALL_NOTES)}"

                        attempt_record = Attempt(
                            route_id=route.id,
                            success=attempt_success,
                            notes=notes_str
                        )
                        db.add(attempt_record)

                    route.attempts = total_burns
                    route.sent = is_sent
                    route.send_type = send_type_choice

        db.commit()
        print(f"\n SUCCESS: Seeding sequence complete. {num_users} users updated smoothly across structural dependencies.")
    except Exception as e:
        db.rollback()
        print(f" Error during execution: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synchronous analytical seed manager.")
    parser.add_argument("-u", "--users", type=int, default=15, help="Number of dense profiles to build.")
    args = parser.parse_args()
    generate_perfect_climbing_data(num_users=args.users)