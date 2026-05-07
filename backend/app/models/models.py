from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

    submissions = relationship("Submission", back_populates="user")

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    duration_minutes = Column(Integer, default=30)
    time_per_question_seconds = Column(Integer, default=60)
    total_questions_limit = Column(Integer, default=0) # 0 means all questions
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="test")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_text = Column(Text)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String) # 'A', 'B', 'C', or 'D'
    marks = Column(Float, default=1.0)

    test = relationship("Test", back_populates="questions")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="SET NULL"), nullable=True)
    
    # Audit static fields (captured at submission time)
    candidate_username = Column(String)
    candidate_name = Column(String)
    test_title = Column(String)
    
    # Analytics
    total_questions = Column(Integer, default=0)
    attempted_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    accuracy = Column(Float, default=0.0)
    
    started_at = Column(DateTime, default=datetime.now)
    submitted_at = Column(DateTime, nullable=True)
    answers_json = Column(Text) # JSON string of user answers

    user = relationship("User", back_populates="submissions")
    test = relationship("Test", back_populates="submissions")
