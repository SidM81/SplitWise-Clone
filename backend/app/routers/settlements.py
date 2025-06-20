from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/settlements", tags=["Settlements"])

@router.post("/")
def settle_up(settle: schemas.SettlementCreate, db: Session = Depends(get_db)):
    db_settlement = models.Settlement(
        from_user_id=settle.from_user_id,
        to_user_id=settle.to_user_id,
        amount=settle.amount
    )
    db.add(db_settlement)
    db.commit()
    return {"message": "Settled"}
