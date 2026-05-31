from fastapi import APIRouter

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

#Create
@router.post("/")
def create_session():
    return {"message": "Session created"}

#Read
@router.get("/")
def get_sessions():
    return {"message": "My sessions"}

#Read single session
@router.get("/{session_id}")
def get_session(session_id: int):
    return {"message": f"Session with ID {session_id}"}

#Update
@router.put("/{session_id}")
def update_session(session_id: int):
    return {"message": f"Update session with ID {session_id}"}

#Delete
@router.delete("/{session_id}")
def delete_session(session_id: int):
    return {"message": f"Delete session with ID {session_id}"}