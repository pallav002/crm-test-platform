from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.session import get_db
from app.models import models
from app.schemas import schemas
from app.core import security
from app.utils.pdf_parser import parse_mcq_pdf
import os
import shutil
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Get the base directory of the backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent

@router.post("/tests", response_model=schemas.Test)
def create_test(
    test_in: schemas.TestCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    test = models.Test(**test_in.dict())
    db.add(test)
    db.commit()
    db.refresh(test)
    logger.info(f"Admin {admin.username} created test: {test.title}")
    return test

@router.get("/tests", response_model=List[schemas.Test])
def get_tests(
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    return db.query(models.Test).options(joinedload(models.Test.questions)).all()

@router.delete("/tests/{test_id}")
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # We allow deletion even if there are submissions because our model
    # uses SET NULL for test_id and preserves test_title in the Submission for auditing.
    db.delete(test)
    db.commit()
    logger.info(f"Admin {admin.username} deleted test ID {test_id}")
    return {"message": "Test deleted successfully. Linked records archived."}

@router.post("/tests/{test_id}/upload-pdf")
async def upload_pdf(
    test_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    upload_dir = BASE_DIR / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / f"{test_id}_{file.filename}"
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        if not file_path.exists():
            raise HTTPException(status_code=500, detail="File system error during save")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    try:
        parsed_questions = parse_mcq_pdf(str(file_path))
        for q in parsed_questions:
            question = models.Question(test_id=test_id, **q)
            db.add(question)
        
        db.commit()
        db.refresh(test)
        logger.info(f"Test {test_id} updated with {len(parsed_questions)} questions by {admin.username}")
        return {
            "message": f"Successfully uploaded and parsed {len(parsed_questions)} questions",
            "saved_to": str(file_path),
            "directory": str(upload_dir.absolute()),
            "question_count": len(parsed_questions)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidates", response_model=List[schemas.User])
def list_candidates(
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    # Only return non-admin users
    return db.query(models.User).filter(models.User.is_admin == False).all()

@router.post("/users", response_model=schemas.User)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user = models.User(
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_admin=user_in.is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"Admin {admin.username} created user: {user.username}")
    return user

@router.delete("/candidates/{user_id}")
def delete_candidate(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_admin == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Cascade SET NULL ensures submissions stay for audit
    db.delete(user)
    db.commit()
    logger.info(f"Admin {admin.username} deleted candidate ID {user_id}")
    return {"message": "Candidate account removed. Historical results preserved for audit."}

@router.get("/results", response_model=List[schemas.Submission])
def get_all_results(
    db: Session = Depends(get_db),
    admin: models.User = Depends(security.get_current_admin_user)
):
    # Return all results, joining relevant tables if they exist
    return db.query(models.Submission).order_by(models.Submission.submitted_at.desc()).all()
