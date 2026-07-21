from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy.orm import Session as DBSession, selectinload
from sqlalchemy import or_

from app.database import get_db
from app.auth import get_current_user
from app.models.users import User
from app.models.friends import FriendRequest
from app.models.sessions import Session
from app.models.attempts import RouteAttempt
from app.schemas.schema import (
    FriendRequestCreate,
    FriendRequestResponse,
    FriendFeedItem,
    FriendFeedResponse,
    sessionResponse,
)

router = APIRouter(prefix = "/friends", tags=["friends"])

@router.post("/request")
def send_friend_request(friend_data:FriendRequestCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])
    
    receiver = db.query(User).filter(User.username == friend_data.username).first()

    if not receiver:
        raise HTTPException(status_code=400, detail="User not found")
    
    if receiver.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")

    existing_friendship = db.query(FriendRequest).filter(or_((FriendRequest.sender_id == user_id) & (FriendRequest.receiver_id == receiver.id),(FriendRequest.sender_id == receiver.id) & (FriendRequest.receiver_id == user_id)), FriendRequest.status == "accepted").first()
    
    if existing_friendship:
        raise HTTPException(status_code=400, detail="You are already friends with this user")

    existing_request = db.query(FriendRequest).filter(FriendRequest.sender_id.in_([user_id, receiver.id]), FriendRequest.receiver_id.in_([user_id, receiver.id]), FriendRequest.status.in_(["pending"])).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="There is already a pending friend request")
    
    friend_request = FriendRequest(sender_id=user_id, receiver_id = receiver.id, status="pending")

    db.add(friend_request)
    db.commit()
    db.refresh(friend_request)

    return friend_request

@router.get("/requests")
def get_friend_requests(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])
    requests = (db.query(FriendRequest, User).join(User, FriendRequest.sender_id == User.id).filter(FriendRequest.receiver_id == user_id, FriendRequest.status == "pending").all())

    return [
        {
            "request_id": request.id,
            "sender_id": request.sender_id,
            "sender_username": user.username,
            "sender_profile_icon": user.profile_icon,
            "status": request.status,
            "created_at": request.created_at
        }
        for request, user in requests
    ]

@router.post("/accept/{request_id}")
def accept_friend_request(request_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])
    friend_request = db.query(FriendRequest).filter(FriendRequest.id == request_id, FriendRequest.receiver_id == user_id, FriendRequest.status == "pending").first()

    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request.status = "accepted"
    db.commit()
    db.refresh(friend_request)

    return friend_request

@router.post("/decline/{request_id}")
def decline_friend_request(request_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])
    friend_request = db.query(FriendRequest).filter(FriendRequest.id == request_id, FriendRequest.receiver_id == user_id, FriendRequest.status == "pending").first()

    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request.status = "declined"
    db.commit()
    db.refresh(friend_request)

    return friend_request


@router.get("/")
def get_friends(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])

    friendships = (db.query(FriendRequest).filter(FriendRequest.status == "accepted", or_(FriendRequest.sender_id == user_id, FriendRequest.receiver_id == user_id)).all())

    friend_ids = [f.receiver_id if f.sender_id == user_id else f.sender_id for f in friendships]

    if not friend_ids:
        return []
    
    friends = (db.query(User).filter(User.id.in_(friend_ids)).all())

    return [
        {
            "friend_id": friend.id,
            "friend_username": friend.username,
            "profile_icon": friend.profile_icon,
        }
        for friend in friends
    ]


@router.delete("/{friend_id}", status_code=204)
def remove_friend(friend_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])

    deleted = db.query(FriendRequest).filter(FriendRequest.status == "accepted", or_((FriendRequest.sender_id == user_id) & (FriendRequest.receiver_id == friend_id), (FriendRequest.sender_id == friend_id) & (FriendRequest.receiver_id == user_id))).delete()
    if not deleted:
        raise HTTPException(status_code=404, detail="Friendship not found")
    db.commit()


@router.get("/feed", response_model=FriendFeedResponse)
def get_friend_feed(limit: int = Query(default=10, ge=1, le=50), cursor: datetime | None = None, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])

    friendships = db.query(FriendRequest).filter(FriendRequest.status == "accepted", or_(FriendRequest.sender_id == user_id, FriendRequest.receiver_id == user_id)).all()

    friend_ids = [f.receiver_id if f.sender_id == user_id else f.sender_id for f in friendships]

    if not friend_ids:
        return FriendFeedResponse(items=[], next_cursor=None)

    query = db.query(Session, User).join(User, Session.user_id == User.id).options(selectinload(Session.route_attempts).selectinload(RouteAttempt.route)).filter(Session.user_id.in_(friend_ids))

    if cursor is not None:
        query = query.filter(Session.date < cursor)

    rows = (
        query.order_by(Session.date.desc(), Session.id.desc()).limit(limit + 1).all()
    )

    has_more = len(rows) > limit
    rows = rows[:limit]

    items = [
        FriendFeedItem(
            **sessionResponse.model_validate(session).model_dump(),
            friend_id=user.id,
            friend_username=user.username,
            friend_profile_icon=user.profile_icon,
        )
        for session, user in rows
    ]

    next_cursor = rows[-1][0].date if has_more and rows else None

    return FriendFeedResponse(items=items, next_cursor=next_cursor)


@router.get("/search")
def search_friends(query: str, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = UUID(current_user["user_id"])

    friends = (db.query(User).filter(User.id != user_id, User.username.ilike(f"%{query}%")).all())

    def relationship_status(friend_id: UUID) -> str:
        request = db.query(FriendRequest).filter(FriendRequest.status.in_(["accepted", "pending"]), or_((FriendRequest.sender_id == user_id) & (FriendRequest.receiver_id == friend_id), (FriendRequest.sender_id == friend_id) & (FriendRequest.receiver_id == user_id))).first()
        if not request:
            return "not_friend"
        return "friend" if request.status == "accepted" else "pending"

    return [
        {
            "friend_id": friend.id,
            "friend_username": friend.username,
            "profile_icon": friend.profile_icon,
            "status": relationship_status(friend.id),
        }
        for friend in friends
    ]


