from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, workspace_router, video_router
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create tables and run migrations
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        # S'assurer que les nouvelles colonnes existent (migrations manuelles simples)
        conn.execute(text("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS suggested_ideas_json TEXT"))
        conn.commit()
    print("Migrations manuelles terminées avec succès.")
except Exception as e:
    print(f"Note: Migration manuelle ignorée ou échouée (déjà à jour ?) : {e}")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TubeAI Creator API")

# 1. Configuration CORS (DOIT ÊTRE EN PREMIER)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://boisterous-naiad-ea4cd9.netlify.app",
        "https://mon-outil-tubeai.netlify.app",
        "https://tubeai.netlify.app",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# 2. Middleware de Logs (Après CORS) et Diagnostic
@app.middleware("http")
async def log_and_diagnose(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        import traceback
        error_msg = f"CRASH: {str(e)}"
        print(f"CRITICAL ERROR: {error_msg}")
        print(traceback.format_exc())
        
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "detail": error_msg,
                "type": type(e).__name__,
                "debug_info": "Check Render logs for traceback"
            }
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
