# app/crud.py
from sqlalchemy.orm import Session
from app import models, schemas
from app.schemas import UserOut, GroupOut
from sqlalchemy import func
from app.models import User

def create_group(db: Session, group: schemas.GroupCreate):
    db_group = models.Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    # Add users to group
    for uid in group.user_ids:
        db.add(models.GroupUser(group_id=db_group.id, user_id=uid))
    db.commit()
    return db_group

def get_group(db: Session, group_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    return group

def get_total_expenses(db: Session, group_id: int):
    total = db.query(func.sum(models.Expense.amount)).filter(models.Expense.group_id == group_id).scalar()
    return total or 0.0

def create_expense(db: Session, group_id: int, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(
        group_id=group_id,
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        split_type=expense.split_type,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    for split in expense.splits:
        amount = split.amount
        if expense.split_type == models.SplitTypeEnum.equal:
            amount = expense.amount / len(expense.splits)
        elif expense.split_type == models.SplitTypeEnum.percentage:
            amount = (expense.amount * (split.percentage or 0)) / 100.0
        db_split = models.ExpenseSplit(
            expense_id=db_expense.id,
            user_id=split.user_id,
            amount=amount,
            percentage=split.percentage
        )
        db.add(db_split)
    db.commit()
    return db_expense

def get_group_balances(db: Session, group_id: int):
    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()
    splits = []
    for expense in expenses:
        splits.extend(db.query(models.ExpenseSplit).filter(models.ExpenseSplit.expense_id == expense.id).all())

    user_net = {}
    for s in splits:
        user_net[s.user_id] = user_net.get(s.user_id, 0) - s.amount

    for e in expenses:
        user_net[e.paid_by] = user_net.get(e.paid_by, 0) + e.amount

    # Preload all involved users
    user_ids = list(user_net.keys())
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u for u in users}

    owes = []
    creditors = [(uid, amt) for uid, amt in user_net.items() if amt > 0]
    debtors = [(uid, amt) for uid, amt in user_net.items() if amt < 0]

    for debtor_id, debt_amt in debtors:
        debt_left = -debt_amt
        for i, (creditor_id, credit_amt) in enumerate(creditors):
            if credit_amt == 0:
                continue
            pay_amt = min(credit_amt, debt_left)
            if pay_amt > 0:
                owes.append({
                    "user_owes": user_map[debtor_id],
                    "user_owed": user_map[creditor_id],
                    "amount": pay_amt,
                })
                debt_left -= pay_amt
                creditors[i] = (creditor_id, credit_amt - pay_amt)
                if debt_left <= 0:
                    break

    return owes

def get_user_balances(db: Session, user_id: int):
    result = []

    # Step 1: Get all groups user is in
    user_groups = db.query(models.Group).join(models.GroupUser).filter(models.GroupUser.user_id == user_id).all()

    for group in user_groups:
        expenses = db.query(models.Expense).filter(models.Expense.group_id == group.id).all()
        splits = []
        for expense in expenses:
            splits.extend(db.query(models.ExpenseSplit).filter(models.ExpenseSplit.expense_id == expense.id).all())

        user_net = {}
        for s in splits:
            user_net[s.user_id] = user_net.get(s.user_id, 0) - s.amount
        for e in expenses:
            user_net[e.paid_by] = user_net.get(e.paid_by, 0) + e.amount

        group_owes = []
        creditors = [(uid, amt) for uid, amt in user_net.items() if amt > 0]
        debtors = [(uid, amt) for uid, amt in user_net.items() if amt < 0]

        for debtor_id, debt_amt in debtors:
            debt_left = -debt_amt
            for i, (creditor_id, credit_amt) in enumerate(creditors):
                if credit_amt == 0:
                    continue
                pay_amt = min(credit_amt, debt_left)
                if pay_amt > 0 and user_id in (debtor_id, creditor_id):
                    group_owes.append({
                        "user_owes": UserOut.model_validate(
                            db.query(models.User).filter(models.User.id == debtor_id).first()
                        ),
                        "user_owed": UserOut.model_validate(
                            db.query(models.User).filter(models.User.id == creditor_id).first()
                        ),
                        "amount": pay_amt,
                    })

                    debt_left -= pay_amt
                    creditors[i] = (creditor_id, credit_amt - pay_amt)
                    if debt_left <= 0:
                        break
        
        total_expense = db.query(func.sum(models.Expense.amount)).filter(models.Expense.group_id == group.id).scalar() or 0.0

        # list of users in the group
        users = db.query(models.User).join(models.GroupUser).filter(models.GroupUser.group_id == group.id).all()
        user_out_list = [schemas.GroupUser.model_validate(u) for u in users]

        result.append({
            "group": schemas.GroupOut(
                id=group.id,
                name=group.name,
                users=user_out_list,
                total_expenses=total_expense
            ),
            "balances": group_owes
        })

    return result
