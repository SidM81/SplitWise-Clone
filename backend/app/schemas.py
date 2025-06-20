# app/schemas.py
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class SplitTypeEnum(str, Enum):
    equal = "equal"
    percentage = "percentage"

class UserBase(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class UserCreate(BaseModel):
    name: str

class UserOut(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class GroupUser(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class GroupBase(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class GroupOut(BaseModel):
    id: int
    name: str
    users: List[GroupUser]
    total_expenses: float

    model_config = {
        "from_attributes": True
    }

class ExpenseSplit(BaseModel):
    user_id: int
    amount: Optional[float] = None
    percentage: Optional[float] = None

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitTypeEnum
    splits: List[ExpenseSplit]

class ExpenseOut(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    split_type: SplitTypeEnum
    splits: List[ExpenseSplit]

    model_config = {
        "from_attributes": True
    }

class Balance(BaseModel):
    user_owes: UserOut
    user_owed: UserOut
    amount: float

    model_config = {"from_attributes": True}

class GroupBalance(BaseModel):
    group: GroupOut
    balances: List[Balance]

    model_config = {"from_attributes": True}
