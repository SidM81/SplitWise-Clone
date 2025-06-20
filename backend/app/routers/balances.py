# app/routes/balances.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, crud, models
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/groups/{group_id}/balances", response_model=List[schemas.Balance])
def group_balances(group_id: int, db: Session = Depends(get_db)):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    owes = crud.get_group_balances(db, group_id)
    return owes

@router.get("/users/{user_id}/balances", response_model=List[schemas.GroupBalance])
def user_balances(user_id: int, db: Session = Depends(get_db)):
    owes = crud.get_user_balances(db, user_id)
    return owes
