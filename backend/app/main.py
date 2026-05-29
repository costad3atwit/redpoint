from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "REDPOINT API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/acwr")
def acwr():
    return {"status": "ok"}

@app.get("/plateau_detector")
def plateau_detector():
    return {"status": "ok"}

@app.get("/training_recommender")
def training_recommender():
    return {"status": "ok"}
