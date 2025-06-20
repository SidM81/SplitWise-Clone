from fastapi import APIRouter, Request, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import get_group_balances, get_user_balances
import requests
import os

router = APIRouter()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
 
@router.post("/query")
async def query_handler(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    query = data.get("query")
    user_id = data.get("user_id")
    group_id = data.get("group_id")

    if not query or user_id is None or group_id is None:
        return {"response": "Please provide a valid query, user ID, and group ID."}

    # Fetch balances
    group_balances = get_group_balances(db, group_id)
    user_balances = get_user_balances(db, user_id)

    # Convert ORM objects to clean JSON-serializable dicts
    clean_group_balances = jsonable_encoder(group_balances)
    clean_user_balances = jsonable_encoder(user_balances)

    context = {
        "query": query,
        "group_balances": clean_group_balances,
        "user_balances": clean_user_balances,
    }

    hf_response = requests.post(
        "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
        headers={"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"},
        json={"inputs": f"Answer the question using the context:\nQuery: {query}\nContext: {context}"}
    )

    print(f"Hugging Face API response: {hf_response.status_code}")
    print(f"Response content: {hf_response.text}")

    if hf_response.status_code == 200:
        result = hf_response.json()
        full_response = result[0]["generated_text"]

        # Only return the part after "Response:"
        if "Response:" in full_response:
            clean_response = full_response.split("Response:", 1)[1].strip()
        else:
            clean_response = full_response.strip()

        return {"response": clean_response}
