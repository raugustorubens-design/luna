import logging
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from supabase import Client, create_client

load_dotenv()

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(title="LUNA Core API", version="1.0.0")


def _create_supabase_client() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError(
            "Missing SUPABASE_URL and/or SUPABASE_KEY environment variables."
        )

    return create_client(supabase_url, supabase_key)


try:
    supabase: Client = _create_supabase_client()
except RuntimeError as exc:
    supabase = None  # type: ignore[assignment]
    logger.error("Supabase client initialization failed: %s", exc)


@app.get("/", response_class=PlainTextResponse)
def root() -> str:
    return "LUNA CORE ONLINE"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/modules")
def get_modules() -> list[dict[str, Any]]:
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase client is not configured. Check environment variables.",
        )

    try:
        response = supabase.table("training_modules").select("*").execute()
        return response.data or []
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error fetching training_modules: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to fetch training modules")
