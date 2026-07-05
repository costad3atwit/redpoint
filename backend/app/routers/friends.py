from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import or_

from app.database import get_db
from app.auth import get_current_user
from app.models.users import User
from app.models.friends import FriendRequest
from app.models.sessions import Session
from app.schemas.schema import FriendRequestCreate, FriendRequestResponse

router = APIRouter(prefix = "/friends", tags=["friends"])

@router.post("/request")
def send_friend_request(friend_data:FriendRequestCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    receiver = db.query(User).filter(User.username == friend_data.username).first()

    if not receiver:
        raise HTTPException(status_code=400, detail="User not found")
    
    if receiver.id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")
    
    existing_request = db.query(FriendRequest).filter(FriendRequest.sender_id.in_([current_user["user_id"], receiver.id]), FriendRequest.receiver_id.in_([current_user["user_id"], receiver.id]), FriendRequest.status.in_(["pending"])).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="There is already a pending friend request")
    
    friend_request = FriendRequest(sender_id=current_user["user_id"], receiver_id = receiver.id, status="pending")

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

@router.get("/activity")
def get_friend_activity(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]

    friendships = db.query(FriendRequest).filter(FriendRequest.status == "accepted", or_(FriendRequest.sender_id.in_([user_id]), FriendRequest.receiver_id.in_([user_id]))).all()

    friend_ids = []

    for friendship in friendships:
        if friendship.sender_id == user_id:
            friend_ids.append(friendship.receiver_id)
        else:
            friend_ids.append(friendship.sender_id)

    recent_climbs = db.query(Session).filter(Session.user_id.in_(friend_ids)).order_by(Session.date.desc()).limit(20).all()

    return recent_climbs