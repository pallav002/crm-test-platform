from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    marks: float = 1.0

class QuestionCreate(QuestionBase):
    correct_option: str

class Question(QuestionBase):
    id: int
    test_id: int
    correct_option: str # Included in the main Question schema for Admin

    class Config:
        from_attributes = True

class QuestionOut(QuestionBase): # Schema for Candidates (No correct_option)
    id: int
    test_id: int

    class Config:
        from_attributes = True

class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    time_per_question_seconds: int = 60
    total_questions_limit: int = 0
    is_active: bool = True

class TestCreate(TestBase):
    pass

class Test(TestBase):
    id: int
    created_at: datetime
    questions: List[Question] = []

    class Config:
        from_attributes = True

class TestOut(TestBase): # Schema for Candidates
    id: int
    created_at: datetime
    questions: List[QuestionOut] = []

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    test_id: int
    answers_json: str

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    user_id: Optional[int]
    test_id: Optional[int]
    
    candidate_username: Optional[str]
    candidate_name: Optional[str]
    test_title: Optional[str]
    
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    score: float
    accuracy: float
    
    started_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
