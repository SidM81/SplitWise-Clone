from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import groups, expenses, balances, users, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Splitwise Clone")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)
app.include_router(users.router)
app.include_router(chat.router)