from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.auth import get_current_user
from app.models.users import User
from app.models.friends import FriendRequest
from app.schemas.schema import FriendRequestCreate, FriendRequestReponse

router = APIRouter(prefix = "/friends", tags=["friends"])

@router.post("/request")
def send_friend_request(friend_data:FriendRequestCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    reciever = db.query(User).filter(User.username == friend_data.username).first()

    if not reciever:
        raise HTTPException(status_code=400, detail="User not found")
    
    if reciever.id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")
    
    existing_request = db.query(FriendRequest).filter(FriendRequest.sender_id.in_([current_user["user_id"], reciever.id]), FriendRequest.receiver_id.in_([current_user["user_id"], reciever.id])).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="There is already a pending friend request")
    
    friend_request = FriendRequest(sender_id=current_user["user_id"], receiver_id = reciever.id, status="pending")

    db.add(friend_request)
    db.commit()
    db.refresh(friend_request)

    return friend_request

#@router.get("/requests")
#def get_friend_requests(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):


#@router.post("/accept/{request_id}")
#ef accept_friend_request(request_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):


#@router.get("/")
#def get_friends(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
