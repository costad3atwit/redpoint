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

router = APIRouter(prefix="/friends", tags=["friends"])


@router.post("/request")
def send_friend_request(
    friend_data: FriendRequestCreate,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["user_id"])

    receiver = db.query(User).filter(User.username == friend_data.username).first()

    if not receiver:
        raise HTTPException(status_code=400, detail="User not found")

    if receiver.id == user_id:
        raise HTTPException(
            status_code=400, detail="You cannot add yourself as a friend"
        )

    existing_friendship = (
        db.query(FriendRequest)
        .filter(
            or_(
                (FriendRequest.sender_id == user_id)
                & (FriendRequest.receiver_id == receiver.id),
                (FriendRequest.sender_id == receiver.id)
                & (FriendRequest.receiver_id == user_id),
            ),
            FriendRequest.status == "accepted",
        )
        .first()
    )

    if existing_friendship:
        raise HTTPException(
            status_code=400, detail="You are already friends with this user"
        )

    existing_request = (
        db.query(FriendRequest)
        .filter(
            FriendRequest.sender_id.in_([user_id, receiver.id]),
            FriendRequest.receiver_id.in_([user_id, receiver.id]),
            FriendRequest.status.in_(["pending"]),
        )
        .first()
    )

    if existing_request:
        raise HTTPException(
            status_code=400, detail="There is already a pending friend request"
        )

    friend_request = FriendRequest(
        sender_id=user_id, receiver_id=receiver.id, status="pending"
    )

    db.add(friend_request)
    db.commit()
    db.refresh(friend_request)

    return friend_request


@router.get("/requests")
def get_friend_requests(
    db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    user_id = UUID(current_user["user_id"])
    requests = (
        db.query(FriendRequest, User)
        .join(User, FriendRequest.sender_id == User.id)
        .filter(FriendRequest.receiver_id == user_id, FriendRequest.status == "pending")
        .all()
    )

    return [
        {
            "request_id": request.id,
            "sender_id": request.sender_id,
            "sender_username": user.username,
            "status": request.status,
            "created_at": request.created_at,
        }
        for request, user in requests
    ]


@router.post("/accept/{request_id}")
def accept_friend_request(
    request_id: UUID,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["user_id"])
    friend_request = (
        db.query(FriendRequest)
        .filter(
            FriendRequest.id == request_id,
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == "pending",
        )
        .first()
    )

    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")

    friend_request.status = "accepted"
    db.commit()
    db.refresh(friend_request)

    return friend_request


@router.post("/decline/{request_id}")
def decline_friend_request(
    request_id: UUID,
    db: DBSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = UUID(current_user["user_id"])
    friend_request = (
        db.query(FriendRequest)
        .filter(
            FriendRequest.id == request_id,
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == "pending",
        )
        .first()
    )

    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")

    friend_request.status = "declined"
    db.commit()
    db.refresh(friend_request)

    return friend_request


@router.get("/")
def get_friends(
    db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    user_id = UUID(current_user["user_id"])

    friendships = (
        db.query(FriendRequest)
        .filter(
            FriendRequest.status == "accepted",
            or_(
                FriendRequest.sender_id == user_id, FriendRequest.receiver_id == user_id
            ),
        )
        .all()
    )

    friend_ids = [
        f.receiver_id if f.sender_id == user_id else f.sender_id for f in friendships
    ]

    if not friend_ids:
        return []

    friends = db.query(User).filter(User.id.in_(friend_ids)).all()

    return [
        {"friend_id": friend.id, "friend_username": friend.username}
        for friend in friends
    ]


@router.get("/activity")
def get_friend_activity(
    db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    user_id = UUID(current_user["user_id"])

    friendships = (
        db.query(FriendRequest)
        .filter(
            FriendRequest.status == "accepted",
            or_(
                FriendRequest.sender_id == user_id, FriendRequest.receiver_id == user_id
            ),
        )
        .all()
    )

    friend_ids = [
        f.receiver_id if f.sender_id == user_id else f.sender_id for f in friendships
    ]

    if not friend_ids:
        return []

    recent_climbs = (
        db.query(Session, User)
        .join(User, Session.user_id == User.id)
        .filter(Session.user_id.in_(friend_ids))
        .order_by(Session.date.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "friend_id": user.id,
            "friend_username": user.username,
            "session_id": session.id,
        }
        for session, user in recent_climbs
    ]


@router.get("/search")
def search_friends(
    query: str, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)
):
    user_id = UUID(current_user["user_id"])

    friends = (
        db.query(User)
        .filter(User.id != user_id, User.username.ilike(f"%{query}%"))
        .all()
    )

    return [
        {
            "friend_id": friend.id,
            "friend_username": friend.username,
            "status": "friend"
            if db.query(FriendRequest)
            .filter(
                FriendRequest.status == "accepted",
                or_(
                    (FriendRequest.sender_id == user_id)
                    & (FriendRequest.receiver_id == friend.id),
                    (FriendRequest.sender_id == friend.id)
                    & (FriendRequest.receiver_id == user_id),
                ),
            )
            .first()
            else "not_friend",
        }
        for friend in friends
    ]
