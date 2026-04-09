"""
Pydantic schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


# ============== Enums ==============

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


# ============== Base Schemas ==============

class ResumeStructure(BaseModel):
    """Structured resume data."""
    name: Optional[str] = None
    contact_info: Optional[Dict[str, str]] = None
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    extracurriculars: List[Dict[str, Any]] = Field(default_factory=list)


class JobStructure(BaseModel):
    """Structured job description data."""
    title: Optional[str] = None
    company: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    qualifications: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    tools_technologies: List[str] = Field(default_factory=list)
    level_expectations: Optional[str] = None
    industry: Optional[str] = None


class SkillGapReport(BaseModel):
    """Skill gap analysis."""
    technical_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    soft_skill_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    experience_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_gaps: List[Dict[str, Any]] = Field(default_factory=list)


class InterviewQuestions(BaseModel):
    """Interview question categories."""
    behavioral: List[Dict[str, str]] = Field(default_factory=list)
    technical: List[Dict[str, str]] = Field(default_factory=list)
    role_specific: List[Dict[str, str]] = Field(default_factory=list)


class ActionPlanStep(BaseModel):
    """Single action plan step."""
    week: int
    priority: str
    action: str
    details: str
    estimated_time: Optional[str] = None


class AlternativeRole(BaseModel):
    """Alternative career path suggestion."""
    role: str
    fit_level: str  # "high", "medium", "low"
    reason: str
    transition_difficulty: str


class RewrittenBullet(BaseModel):
    """Original and rewritten resume bullet."""
    original: str
    rewritten: str
    section: str  # "experience", "projects", etc.
    reasoning: str


class ResumeImprovement(BaseModel):
    """Resume improvement suggestion."""
    issue: str
    severity: str  # "high", "medium", "low"
    suggestion: str
    section: Optional[str] = None


# ============== Request Schemas ==============

class IntakeFormRequest(BaseModel):
    """Intake form submission."""
    target_role: str = Field(..., min_length=2, max_length=200)
    alternative_roles: Optional[str] = None
    year_in_school: Optional[str] = None
    graduation_status: Optional[str] = None
    major: Optional[str] = None
    industries: Optional[str] = None
    confidence_level: Optional[str] = None
    biggest_concern: Optional[str] = None
    perceived_gaps: Optional[str] = None
    strengths: Optional[str] = None
    guidance_tone: GuidanceTone = GuidanceTone.BALANCED


class AnalyzeRequest(BaseModel):
    """Request to start analysis."""
    session_id: str
    job_description: str = Field(..., min_length=50)
    intake: IntakeFormRequest


class ChatMessageRequest(BaseModel):
    """Chat message request."""
    message: str = Field(..., min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    """Chat request with context."""
    session_id: str
    message: ChatMessageRequest


# ============== Response Schemas ==============

class UploadResponse(BaseModel):
    """File upload response."""
    session_id: str
    filename: str
    file_size: int
    parsing_status: str
    warnings: Optional[List[str]] = None


class AnalysisStatusResponse(BaseModel):
    """Analysis status response."""
    session_id: str
    status: AnalysisStatus
    status_message: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CareerReportResponse(BaseModel):
    """Complete career report response."""
    session_id: str
    executive_summary: str
    fit_assessment: str
    overall_match_score: Optional[int] = None
    strengths: List[Dict[str, Any]]
    weaknesses: List[Dict[str, Any]]
    skill_gaps: SkillGapReport
    resume_improvements: List[ResumeImprovement]
    rewritten_bullets: List[RewrittenBullet]
    interview_questions: InterviewQuestions
    alternative_roles: List[AlternativeRole]
    action_plan: List[ActionPlanStep]
    confidence_notes: List[str]
    created_at: datetime


class ChatMessageResponse(BaseModel):
    """Chat message response."""
    role: str = "assistant"
    content: str
    suggested_followups: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatHistoryResponse(BaseModel):
    """Chat history response."""
    session_id: str
    messages: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str = "1.0.0"
    chatbot_provider: str
    chatbot_model: str


class ExportReportRequest(BaseModel):
    """Export report request."""
    session_id: str
    format: str = "markdown"  # "markdown", "json", "pdf"
