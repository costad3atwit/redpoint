import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.users import User
from app.models.sessions import Session as TrainingSession
from app.models.routes import Route
from app.models.attempts import Attempt
from app.auth import hash_password

def seed_fake_data():
    # 1. Force clear and recreate all registered tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("🌱 Seeding fake data into PostgreSQL container...")
        
        # 2. Add a fake user account with a pre-computed bcrypt hash for "password123"
        test_user = User(
            email="tester@wentworth.edu",
            # This bypasses the passlib engine entirely during testing
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wK6eCHGlA25Ch7A76M1fK"
        )
        db.add(test_user)
        db.flush()
        
        # 3. Add a fake climbing session matching your partner's constraints
        test_session = TrainingSession(
            user_id=test_user.id,
            date="2026-06-01",
            duration_minutes=90,          # Satisfies the NOT NULL constraint!
            rpe=7,                         # Rate of Perceived Exertion (1-10)
            finger_load_rating=3,          # Custom metric tracking finger fatigue
            notes="Felt strong, finger tendons felt completely stable."
        )
        db.add(test_session)
        db.flush()
        
        # 4. Add a fake route on the wall (Dynamically mapping your partner's columns)
        test_route = Route()
        test_route.session_id = test_session.id
        test_route.grade = "V4"
        test_route.wall_type = "Overhang"
        
        # Fallback check: Did your partner name it 'route_color', 'hold_color', or skip it?
        if hasattr(test_route, 'color'):
            test_route.color = "Blue"
        elif hasattr(test_route, 'route_color'):
            test_route.route_color = "Blue"
        elif hasattr(test_route, 'hold_color'):
            test_route.hold_color = "Blue"
            
        db.add(test_route)
        db.flush()
        
        # 5. Add fake attempts matching your new integer key layout
        attempt_1 = Attempt(
            route_id=test_route.id, # This will seamlessly pull the real integer id now!
            success=False,
            notes="Slipped right off the start volume. Crux is tough."
        )
        attempt_2 = Attempt(
            route_id=test_route.id,
            success=True,
            notes="Sent it! Used a high heel hook on the left side."
        )
        
        db.add_all([attempt_1, attempt_2])
        db.commit()
        print("✅ Database successfully seeded with fake data metrics!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_fake_data()