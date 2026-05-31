from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

#Create
@router.post("/")
def create_user():
    return {"message": "User created"}

#Read
@router.get("/")
def get_users():
    return {"message": "All users"}

#Read single user
@router.get("/{user_id}")
def get_user(user_id: int):
    return {"message": f"User with ID {user_id}"}

#Update
@router.put("/{user_id}")
def update_user(user_id: int):
    return {"message": f"Update user with ID {user_id}"}

#Delete
@router.delete("/{user_id}")
def delete_user(user_id: int):
    return {"message": f"Delete user with ID {user_id}"}

