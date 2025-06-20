# app/routes/expenses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/groups/{group_id}/expenses", response_model=schemas.ExpenseOut)
def add_expense(group_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    group = crud.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Validate paid_by is in group
    if expense.paid_by not in [gu.user_id for gu in group.users]:
        raise HTTPException(status_code=400, detail="paid_by user not in group")

    # Validate splits users in group
    group_user_ids = [gu.user_id for gu in group.users]
    for split in expense.splits:
        if split.user_id not in group_user_ids:
            raise HTTPException(status_code=400, detail=f"user_id {split.user_id} in splits not in group")

    # For percentage split, check sum is 100%
    if expense.split_type == models.SplitTypeEnum.percentage:
        total_percentage = sum([s.percentage or 0 for s in expense.splits])
        if abs(total_percentage - 100.0) > 0.01:
            raise HTTPException(status_code=400, detail="Percentage splits must sum to 100")

    db_expense = crud.create_expense(db, group_id, expense)
    return db_expense
