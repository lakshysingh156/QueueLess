from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import hospitals, search, queue

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="QueueLess API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hospitals.router, prefix="/api/hospitals", tags=["hospitals"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(queue.router, prefix="/api/queue", tags=["queue"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "QueueLess API"}
