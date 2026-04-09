"""
Database models for the AI Career Coach application.
"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
import json


class GuidanceTone(str, Enum):
    """Guidance tone options."""
    AMBITIOUS = "ambitious"
    REALISTIC = "realistic"
    BALANCED = "balanced"


class AnalysisStatus(str, Enum):
    """Analysis session status."""
    PENDING = "pending"
    PARSING = "parsing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class ResumeDocument(SQLModel, table=True):
    """Parsed resume document."""
    __tablename__ = "resumes"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    filename: str
    file_path: str
    raw_text: str
    parsed_structure: Optional[str] = Field(default=None)  # JSON string
    parsing_warnings: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    session: Optional["AnalysisSession"] = Relationship(back_populates="resume")


class JobDescription(SQLModel, table=True):
    """Job description data."""
    __tablename__ = "job_descriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    raw_text: str
    parsed_structure: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    session: Optional["AnalysisSession"] = Relationship(back_populates="job_description")


class IntakeProfile(SQLModel, table=True):
    """User intake questionnaire responses."""
    __tablename__ = "intake_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)

    # Core info
    target_role: str
    alternative_roles: Optional[str] = None
    year_in_school: Optional[str] = None
    graduation_status: Optional[str] = None
    major: Optional[str] = None
    industries: Optional[str] = None

    # Self-assessment
    confidence_level: Optional[str] = None
    biggest_concern: Optional[str] = None
    perceived_gaps: Optional[str] = None
    strengths: Optional[str] = None

    # Guidance preference
    guidance_tone: GuidanceTone = Field(default=GuidanceTone.BALANCED)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    session: Optional["AnalysisSession"] = Relationship(back_populates="intake_profile")


class CareerReport(SQLModel, table=True):
    """Generated career analysis report."""
    __tablename__ = "career_reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)

    # Report sections stored as JSON
    executive_summary: str
    fit_assessment: str
    strengths: str  # JSON list
    weaknesses: str  # JSON list
    skill_gaps: str  # JSON object
    resume_improvements: str  # JSON list
    rewritten_bullets: str  # JSON list
    interview_questions: str  # JSON object
    alternative_roles: str  # JSON list
    action_plan: str  # JSON list
    confidence_notes: str  # JSON list
    overall_match_score: Optional[int] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    session: Optional["AnalysisSession"] = Relationship(back_populates="report")


class ChatMessage(SQLModel, table=True):
    """Chat messages for a session."""
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AnalysisSession(SQLModel, table=True):
    """Main analysis session linking all components."""
    __tablename__ = "analysis_sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True, unique=True)
    status: AnalysisStatus = Field(default=AnalysisStatus.PENDING)
    status_message: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    resume: Optional[ResumeDocument] = Relationship(back_populates="session")
    job_description: Optional[JobDescription] = Relationship(back_populates="session")
    intake_profile: Optional[IntakeProfile] = Relationship(back_populates="session")
    report: Optional[CareerReport] = Relationship(back_populates="session")
