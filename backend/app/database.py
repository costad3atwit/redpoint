# Import the tools needed to create a database engine and session factory
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# Grab the database URL from your hidden .env file config
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:yourpassword@db:5432/climbing_tracker")

# Create the actual core connection engine to PostgreSQL
engine = create_engine(DATABASE_URL)

# Create a SessionLocal class. Each instance of this will be an active database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the Base class we've been trying to import! Your models will inherit from this.
Base = declarative_base()

# Helper function to get a database session and close it cleanly when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()