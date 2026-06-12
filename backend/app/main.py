from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, sessions, analytics, routes, route_attempts
from app.database import Base, engine

import app.models.users
import app.models.sessions
import app.models.routes
import app.models.attempts

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # TODO: add CloudFront domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(routes.router)
app.include_router(route_attempts.router)


@app.get("/")
def read_root():
    return {"message": "REDPOINT API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
