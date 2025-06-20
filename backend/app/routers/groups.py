# app/routes/groups.py
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

@router.post("/groups", response_model=schemas.GroupOut)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    db_group = crud.create_group(db, group)
    total_expenses = crud.get_total_expenses(db, db_group.id)
    users = [db.query(models.User).filter(models.User.id == gu.user_id).first() for gu in db_group.users]
    return schemas.GroupOut(
        id=db_group.id,
        name=db_group.name,
        users=users,
        total_expenses=total_expenses,
    )

@router.get("/groups", response_model=List[schemas.GroupBase])
def get_groups(db: Session = Depends(get_db)):
    return db.query(models.Group).all()

@router.get("/groups/{group_id}", response_model=schemas.GroupOut)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    total_expenses = crud.get_total_expenses(db, group.id)
    users = [db.query(models.User).filter(models.User.id == gu.user_id).first() for gu in group.users]
    return schemas.GroupOut(
        id=group.id,
        name=group.name,
        users=users,
        total_expenses=total_expenses,
    )
