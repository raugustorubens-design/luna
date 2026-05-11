from fastapi import FastAPI
from pydantic import BaseModel

from apps.api.core.ai_gateway.gateway import AIGateway

app = FastAPI()
gateway = AIGateway()


# ---- Request schema ----
class ChatRequest(BaseModel):
    user_id: str
    message: str


# ---- Endpoint ----
@app.post("/chat")
def chat(req: ChatRequest):
    response = gateway.generate(
        user_id=req.user_id,
        prompt=req.message
    )

    return {
        "reply": response
    }


# ---- Health check ----
@app.get("/")
def root():
    return {"status": "LUNA API running"}