# backend/routes/admin.py
from fastapi import APIRouter, Depends
from dependencies import get_current_user
from schemas.schemas import UserInJWT, UserRole
from fastapi import HTTPException, status

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/overview")
def admin_overview(current_user: UserInJWT = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return {"message": f"Bienvenido {current_user.name}, eres admin."}
