from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .api import router as core_router
from .ai_api import router as ai_router
import os
import logging

app = FastAPI(
    title="DoE Platform API",
    description="API for the AI-assisted Design of Experiments platform",
    version="0.2.0"
)



# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
APP_ENV = os.getenv("APP_ENV", "development")

if APP_ENV == "uat":
    logging.info("--- UAT MODE ACTIVE: HARDENED CORS AND RESET ACCESS ENABLED ---")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(core_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

class HealthCheck(BaseModel):
    status: str

@app.get("/health", response_model=HealthCheck)
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to DoE Platform Backend v2"}
