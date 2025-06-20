# create_users.py
from backend.app.database import SessionLocal, engine, Base
from backend.app import models

# Create tables if not already created
Base.metadata.create_all(bind=engine)

def create_initial_users():
    db = SessionLocal()
    try:
        users = [
            models.User(name="Alice"),
            models.User(name="Bob"),
            models.User(name="Charlie"),
            models.User(name="David"),
            models.User(name="Eve"),
        ]
        db.add_all(users)
        db.commit()
        print("Initial users created.")
    except Exception as e:
        print("Error creating users:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_users()
