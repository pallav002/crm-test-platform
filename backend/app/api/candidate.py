from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.db.session import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter()

@router.get("/available-tests", response_model=List[schemas.TestOut])
def get_available_tests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Only show active tests that the user hasn't submitted yet
    submitted_test_ids = [s.test_id for s in current_user.submissions]
    return db.query(models.Test).filter(
        models.Test.is_active == True,
        ~models.Test.id.in_(submitted_test_ids)
    ).all()

@router.get("/tests/{test_id}", response_model=schemas.TestOut)
def get_test_details(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Security: check if already submitted
    existing = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.test_id == test_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Test already submitted by this user")

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Respect total_questions_limit if defined
    if test.total_questions_limit > 0 and len(test.questions) > test.total_questions_limit:
        test.questions = test.questions[:test.total_questions_limit]
        
    return test

@router.post("/tests/{test_id}/submit", response_model=schemas.Submission)
def submit_test(
    test_id: int,
    answers_in: dict, # Format: {"question_id": "selected_option"}
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    # Check if already submitted
    existing = db.query(models.Submission).filter(
        models.Submission.user_id == current_user.id,
        models.Submission.test_id == test_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Test already submitted")
    
    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Analytics Calculation
    total_q = len(test.questions)
    attempted_q = 0
    correct_q = 0
    wrong_q = 0
    score = 0.0
    
    for q in test.questions:
        user_answer = answers_in.get(str(q.id))
        if user_answer:
            attempted_q += 1
            if user_answer == q.correct_option:
                correct_q += 1
                score += q.marks
            else:
                wrong_q += 1
    
    accuracy = (correct_q / attempted_q * 100) if attempted_q > 0 else 0.0
            
    submission = models.Submission(
        user_id=current_user.id,
        test_id=test_id,
        
        # Static audit capture
        candidate_username=current_user.username,
        candidate_name=current_user.full_name,
        test_title=test.title,
        
        # Advanced Analytics
        total_questions=total_q,
        attempted_questions=attempted_q,
        correct_answers=correct_q,
        wrong_answers=wrong_q,
        score=score,
        accuracy=accuracy,
        
        submitted_at=datetime.now(),
        answers_json=json.dumps(answers_in)
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission
