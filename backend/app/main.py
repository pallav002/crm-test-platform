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

from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

app = FastAPI(title=settings.PROJECT_NAME)

# Dynamic CORS Middleware to handle Vercel subdomains
class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin:
            # Allow localhost, Render, Vercel, and GitHub Pages
            if (
                "localhost" in origin or 
                "127.0.0.1" in origin or 
                "onrender.com" in origin or 
                origin.endswith(".vercel.app") or
                origin.endswith(".github.io")
            ):
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "*"
                response.headers["Access-Control-Allow-Headers"] = "*"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            return Response(
                content="OK",
                headers={
                    "Access-Control-Allow-Origin": origin or "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "true",
                },
            )
        return response

app.add_middleware(DynamicCORSMiddleware)


app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(candidate.router, prefix=f"{settings.API_V1_STR}/candidate", tags=["candidate"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TestFlow API"}

def init_db():
    from app.db.session import SessionLocal
    # Ensure database directory exists if using a subfolder
    if "sqlite:///./database/" in settings.DATABASE_URL:
        os.makedirs("./database", exist_ok=True)
        
    db = SessionLocal()
    try:
        # Create default admin if not exists
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            print("INFO: Creating default admin user...")
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
        else:
            # Optionally update password to ensure it's admin123 and correctly hashed
            admin_user.hashed_password = security.get_password_hash("admin123")
            db.commit()
            print("INFO: Admin user already exists. Password reset to default for safety.")
    except Exception as e:
        print(f"ERROR: Could not initialize database: {e}")
    finally:
        db.close()

# Run initialization
init_db()

