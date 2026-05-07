from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.session import engine, get_db, Base
from app.models import models
from app.core.config import settings
from app.core import security
from app.schemas import schemas
import os

from app.api import auth, admin, candidate

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(candidate.router, prefix=f"{settings.API_V1_STR}/candidate", tags=["candidate"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TestFlow API"}

def init_db():
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        # Create default admin if not exists
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                hashed_password=security.get_password_hash("admin123"),
                full_name="Administrator",
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("INFO: Default admin user created successfully.")
    except Exception as e:
        print(f"ERROR: Could not initialize database: {e}")
    finally:
        db.close()

init_db()
