# Splitwise Clone

A full-stack expense splitting application with AI chatbot support built using FastAPI (backend) and React (frontend).

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Prerequisites](#prerequisites)  
- [Setup and Run](#setup-and-run)  
- [API Documentation](#api-documentation)  
- [Assumptions](#assumptions)  
- [Folder Structure](#folder-structure)  
- [License](#license)  

---

## Project Overview

*System Architecture*

This project is a Splitwise-like application that allows users to:
- Manage groups and split expenses
- Query balances using an AI-powered chatbot
- View interactive expense visualizations

**Tech Stack**:
- 🐍 Backend: FastAPI + Python 3.12
- ⚛️ Frontend: React + Vite
- 🐳 Containerization: Docker Compose

---

## Features

- User & group management  
- Expense splitting and balance tracking  
- AI chatbot interface to query balances and expenses  
- React frontend with live chat and selections  
- FastAPI backend exposing RESTful API endpoints  
- Development environment using Docker for easy setup  

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed  
- (Optional) `make` command (for convenience, if not available run docker-compose commands manually)  
- Node.js and Python are **not required** if using Docker  

---

## Setup and Run

Clone the repo:

git clone https://github.com/yourusername/splitwise-clone.git](https://github.com/SidM81/SplitWise-Clone.git
cd splitwise-clone

Run:

```
docker-compose up --build
```

What This Does

    Builds Docker images for both backend and frontend

    Starts the services:

        Backend: http://localhost:8000

        Frontend: http://localhost:5173

Stopping the Services

To stop and clean up:

```
docker-compose down
```
Other Option:
```
1st Terminal
cd backend && uvicorn app.main:app --reload
2nd Terminal
cd frontend && npm run dev
```

Note:

    Ensure that Docker is installed and running on your machine.

    Run these commands in your terminal or PowerShell.

---

## API Documentation

The backend provides the following API endpoints:

| Endpoint         | Method | Description                                      | Request Body / Params                          |
|------------------|--------|------------------------------------------------|-----------------------------------------------|
| `/users/`        | GET    | Get list of all users                           | None                                          |
| `/groups/`       | GET    | Get list of all groups                          | None                                          |
| `/query`         | POST   | Send a natural language query with user and group context | JSON: `{ "query": "string", "user_id": "string", "group_id": "string" }` |
| `/expenses/`      | POST   |  Create a new expense           | JSON with expense details                      |
| `/balances/`     | GET    |  Get balances for users/groups | Query parameters                              |

> For full OpenAPI docs, visit: [http://localhost:8000/docs](http://localhost:8000/docs) when the backend is running.

---

## Assumptions Made

- The backend API serves on `http://localhost:8000`.
- The frontend runs on `http://localhost:5173` (default Vite port).
- User IDs and Group IDs are strings and correspond to actual entries in the backend database.
- The chatbot endpoint `/query` expects JSON with keys: `query`, `user_id`, and `group_id`.
- Docker is installed and running on the host machine for containerized setup.
- The Python backend uses Python 3.12.5.
- The frontend is a React app bootstrapped with Vite.
- `docker-compose.yml` handles both backend and frontend containers.
- Environment variables and secrets are managed locally (e.g., `.env` files) but are not included in this repo for security.

---

## Folder Structure

    splitwise-clone/
    ├── backend/              # FastAPI backend app
    │   ├── app/
    │   │   ├── routers/      # API route handlers
    │   │   ├── crud.py       # CRUD operations
    │   │   ├── database.py   # Database connection
    │   │   ├── main.py       # FastAPI app entrypoint
    │   │   ├── models.py     # ORM models
    │   │   └── schemas.py    # Pydantic schemas
    │   ├── Dockerfile        # Backend Dockerfile
    │   ├── requirements.txt  # Backend dependencies
    │   └── .env              # Environment variables (not committed)
    ├── frontend/             # React frontend app
    │   ├── src/              # React source code
    │   ├── public/           # Static assets
    │   ├── package.json
    │   ├── vite.config.ts
    │   └── Dockerfile        # Frontend Dockerfile
    ├── docker-compose.yml    # Full stack Docker Compose setup
    ├── README.md             # Project documentation
    └── .gitignore            # Git ignore rules

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
