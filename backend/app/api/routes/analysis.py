"""
Analysis and report generation endpoints.
"""
import json
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlmodel import Session, select

from app.db.database import get_session
from app.models.models import (
    AnalysisSession, AnalysisStatus, ResumeDocument, JobDescription,
    IntakeProfile, CareerReport
)
from app.schemas.schemas import (
    AnalyzeRequest, AnalysisStatusResponse, CareerReportResponse,
    JobStructure, ResumeStructure, GuidanceTone
)
from app.utils.job_parser import parse_job_description
from app.services.report_generator import report_generator

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze")
async def start_analysis(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    """
    Start the career analysis process.
    """
    # Get session
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == request.session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Upload resume first.")

    # Update session status
    session.status = AnalysisStatus.ANALYZING
    session.status_message = "Starting analysis..."
    db.commit()

    try:
        # Get resume
        resume = db.exec(
            select(ResumeDocument).where(ResumeDocument.session_id == request.session_id)
        ).first()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Parse job description
        job_structure = parse_job_description(request.job_description)

        # Save job description
        job_doc = JobDescription(
            session_id=request.session_id,
            raw_text=request.job_description,
            parsed_structure=json.dumps(job_structure)
        )
        db.add(job_doc)

        # Save intake profile
        intake_data = request.intake.dict()
        intake_profile = IntakeProfile(
            session_id=request.session_id,
            **intake_data
        )
        db.add(intake_profile)

        db.commit()

        # Start background analysis
        background_tasks.add_task(
            generate_report_task,
            request.session_id,
            resume.raw_text,
            json.loads(resume.parsed_structure or "{}"),
            request.job_description,
            job_structure,
            intake_data
        )

        return {"session_id": request.session_id, "status": "analysis_started"}

    except Exception as e:
        session.status = AnalysisStatus.FAILED
        session.error_message = str(e)
        db.commit()
        logger.error(f"Analysis start failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


async def generate_report_task(
    session_id: str,
    resume_text: str,
    resume_structure: dict,
    job_text: str,
    job_structure: dict,
    intake: dict
):
    """Background task to generate the report."""
    from app.db.database import engine
    from sqlmodel import Session

    with Session(engine) as db:
        try:
            session = db.exec(
                select(AnalysisSession).where(AnalysisSession.session_id == session_id)
            ).first()

            if not session:
                logger.error(f"Session {session_id} not found for report generation")
                return

            session.status_message = "Analyzing career alignment..."
            db.commit()

            # Generate report
            report_data = await report_generator.generate_report(
                resume_text=resume_text,
                resume_structure=resume_structure,
                job_text=job_text,
                job_structure=job_structure,
                intake=intake
            )

            # Save report to database
            report = CareerReport(
                session_id=session_id,
                executive_summary=report_data.get("executive_summary", ""),
                fit_assessment=json.dumps(report_data.get("fit_assessment", {})),
                overall_match_score=report_data.get("overall_match_score"),
                strengths=json.dumps(report_data.get("strengths", [])),
                weaknesses=json.dumps(report_data.get("weaknesses", [])),
                skill_gaps=json.dumps(report_data.get("skill_gaps", {})),
                resume_improvements=json.dumps(report_data.get("resume_improvements", [])),
                rewritten_bullets=json.dumps(report_data.get("rewritten_bullets", [])),
                interview_questions=json.dumps(report_data.get("interview_questions", {})),
                alternative_roles=json.dumps(report_data.get("alternative_roles", [])),
                action_plan=json.dumps(report_data.get("action_plan", [])),
                confidence_notes=json.dumps(report_data.get("confidence_notes", []))
            )

            db.add(report)

            session.status = AnalysisStatus.COMPLETED
            session.status_message = "Report generated successfully"
            db.commit()

            logger.info(f"Report generated for session {session_id}")

        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            session.status = AnalysisStatus.FAILED
            session.error_message = str(e)
            db.commit()


@router.get("/status/{session_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    session_id: str,
    db: Session = Depends(get_session)
):
    """Get the current analysis status."""
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return AnalysisStatusResponse(
        session_id=session.session_id,
        status=session.status,
        status_message=session.status_message,
        error_message=session.error_message,
        created_at=session.created_at,
        updated_at=session.updated_at
    )


@router.get("/report/{session_id}", response_model=CareerReportResponse)
async def get_report(
    session_id: str,
    db: Session = Depends(get_session)
):
    """Get the generated career report."""
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != AnalysisStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Report not ready. Current status: {session.status}"
        )

    report = db.exec(
        select(CareerReport).where(CareerReport.session_id == session_id)
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Parse JSON fields
    return CareerReportResponse(
        session_id=report.session_id,
        executive_summary=report.executive_summary,
        fit_assessment=report.fit_assessment,
        overall_match_score=report.overall_match_score,
        strengths=json.loads(report.strengths) if report.strengths else [],
        weaknesses=json.loads(report.weaknesses) if report.weaknesses else [],
        skill_gaps=json.loads(report.skill_gaps) if report.skill_gaps else {},
        resume_improvements=json.loads(report.resume_improvements) if report.resume_improvements else [],
        rewritten_bullets=json.loads(report.rewritten_bullets) if report.rewritten_bullets else [],
        interview_questions=json.loads(report.interview_questions) if report.interview_questions else {},
        alternative_roles=json.loads(report.alternative_roles) if report.alternative_roles else [],
        action_plan=json.loads(report.action_plan) if report.action_plan else [],
        confidence_notes=json.loads(report.confidence_notes) if report.confidence_notes else [],
        created_at=report.created_at
    )