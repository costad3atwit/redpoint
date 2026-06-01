from fastapi import FastAPI
from app.routers import users, sessions, analytics
from app.database import Base, engine

import app.models.users
import app.models.sessions
import app.models.routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(sessions.router)
app.include_router(users.router)
app.include_router(analytics.router)


@app.get("/")
def read_root():
    return {"message": "REDPOINT API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}