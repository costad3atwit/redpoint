from fastapi import FastAPI
from app.routers import users, sessions, analytics

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