from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, workspace_router, video_router
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TubeAI Creator API")

@app.middleware("http")
async def log_auth_header(request, call_next):
    auth_header = request.headers.get("authorization")
    print(f"DEBUG: {request.method} {request.url.path} - Auth Header: {'Present' if auth_header else 'MISSING'}")
    return await call_next(request)

# CORS - Maximally permissive for port 8080
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(workspace_router.router)
app.include_router(video_router.router)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
