import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.users import User
from app.models.sessions import Session as TrainingSession
from app.models.routes import Route
from app.models.attempts import Attempt

def seed_fake_data():
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("🌱 Seeding fake data into PostgreSQL container using UUID layout...")
        
        test_user = User(
            username="tester",
            email="tester@wentworth.edu",
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36wK6eCHGlA25Ch7A76M1fK"
        )
        db.add(test_user)
        db.flush() 
        
        test_session = TrainingSession(
            user_id=test_user.id,
            date="2026-06-01",
            duration_minutes=90,        
            rpe=7,                        
            finger_load_rating=3,         
            notes="Felt strong, finger tendons felt completely stable."
        )
        db.add(test_session)
        db.flush() 
        
        test_route = Route()
        test_route.session_id = test_session.id
        test_route.grade = "V4"
        test_route.wall_angle = "Overhang" 

        if hasattr(test_route, 'color'):
            test_route.color = "Blue"
        elif hasattr(test_route, 'route_color'):
            test_route.route_color = "Blue"
        elif hasattr(test_route, 'hold_color'):
            test_route.hold_color = "Blue"
            
        db.add(test_route)
        db.flush() 

        attempt_1 = Attempt(
            route_id=test_route.id, 
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