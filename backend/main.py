from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth as auth_routes
from .api import boards as board_routes
from .api import websocket as ws_routes
from .api import collaboration as collab_routes
from .config import get_settings
from .database import Base, engine


settings = get_settings()

# Create tables on startup (for simplicity). For real production use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

origins = [origin.strip() for origin in settings.backend_cors_origins.split(",") if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def health_check():
    return {"status": "ok"}


app.include_router(auth_routes.router)
app.include_router(board_routes.router)
app.include_router(collab_routes.router)
app.include_router(ws_routes.router)


