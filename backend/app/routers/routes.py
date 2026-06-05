from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.routes import Route
from app.models.sessions import Session as TrainingSession
from app.schemas.schema import routeCreate, routeResponse

router = APIRouter(
    tags=["routes"],
)

@router.post("/sessions/{session_id}/routes", response_model=routeResponse)
def create_route(session_id: int, route_data: routeCreate, db: DBSession = Depends(get_db)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    route = Route(session_id=session_id, **route_data.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route

@router.get("/sessions/{session_id}/routes", response_model=list[routeResponse])
def get_routes_for_session(session_id: int, db: DBSession = Depends(get_db)):
    return db.query(Route).filter(Route.session_id == session_id).all()

@router.get("/routes/{route_id}", response_model=routeResponse)
def get_route(route_id: int, db: DBSession = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.put("/routes/{route_id}", response_model=routeResponse)
def update_route(route_id: int, route_data: routeCreate, db: DBSession = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    for key, value in route_data.model_dump().items():
        setattr(route, key, value)
    db.commit()
    db.refresh(route)
    return route

@router.delete("/routes/{route_id}")
def delete_route(route_id: int, db: DBSession = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
    return {"message": f"Deleted route with ID {route_id}"}