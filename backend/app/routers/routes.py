from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession, joinedload

from app.database import get_db
from app.models.routes import Route
from app.schemas.schema import routeCreate, routeResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/routes",
    tags=["routes"],
)

@router.get("/", response_model=list[routeResponse])
def get_routes(db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    routes = (
        db.query(Route)
        .filter(Route.user_id == current_user["user_id"])
        .options(joinedload(Route.attempts))
        .all()
    )
    result = []
    for r in routes:
        data = routeResponse.model_validate(r).model_dump()
        lengths = [a.route_length for a in r.attempts if a.route_length is not None]
        data["last_route_length"] = lengths[0] if lengths else None
        result.append(data)
    return result

@router.post("/", response_model=routeResponse)
def create_route(route_data: routeCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    route = Route(user_id=current_user["user_id"], **route_data.model_dump(exclude_none=True))
    db.add(route)
    db.commit()
    db.refresh(route)
    return route

@router.get("/{route_id}", response_model=routeResponse)
def get_route(route_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    route = db.query(Route).filter(Route.id == route_id, Route.user_id == current_user["user_id"]).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.put("/{route_id}", response_model=routeResponse)
def update_route(route_id: UUID, route_data: routeCreate, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    route = db.query(Route).filter(Route.id == route_id, Route.user_id == current_user["user_id"]).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    for key, value in route_data.model_dump(exclude_none=True).items():
        setattr(route, key, value)
    db.commit()
    db.refresh(route)
    return route

@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: UUID, db: DBSession = Depends(get_db), current_user=Depends(get_current_user)):
    route = db.query(Route).filter(Route.id == route_id, Route.user_id == current_user["user_id"]).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
