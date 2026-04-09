"""
Chat endpoints for follow-up coaching.
"""
import json
import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, desc
from sse_starlette.sse import EventSourceResponse

from app.db.database import get_session
from app.models.models import (
    AnalysisSession, CareerReport, ResumeDocument, JobDescription,
    IntakeProfile, ChatMessage
)
from app.schemas.schemas import (
    ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse
)
from app.services.chatbot_service import chatbot_service, ChatSessionManager

logger = logging.getLogger(__name__)
router = APIRouter()


def get_session_context(
    session_id: str,
    db: Session
) -> dict:
    """Gather all context for a session."""
    # Get all related data
    resume = db.exec(
        select(ResumeDocument).where(ResumeDocument.session_id == session_id)
    ).first()

    job = db.exec(
        select(JobDescription).where(JobDescription.session_id == session_id)
    ).first()

    intake = db.exec(
        select(IntakeProfile).where(IntakeProfile.session_id == session_id)
    ).first()

    report = db.exec(
        select(CareerReport).where(CareerReport.session_id == session_id)
    ).first()

    # Build context
    context = {
        "resume_text": resume.raw_text if resume else "",
        "resume_structure": json.loads(resume.parsed_structure) if resume and resume.parsed_structure else {},
        "job_text": job.raw_text if job else "",
        "job_structure": json.loads(job.parsed_structure) if job and job.parsed_structure else {},
        "intake": {
            "target_role": intake.target_role if intake else "",
            "alternative_roles": intake.alternative_roles if intake else "",
            "year_in_school": intake.year_in_school if intake else "",
            "graduation_status": intake.graduation_status if intake else "",
            "major": intake.major if intake else "",
            "industries": intake.industries if intake else "",
            "confidence_level": intake.confidence_level if intake else "",
            "biggest_concern": intake.biggest_concern if intake else "",
            "perceived_gaps": intake.perceived_gaps if intake else "",
            "strengths": intake.strengths if intake else "",
            "guidance_tone": intake.guidance_tone if intake else "balanced"
        },
        "report": {
            "executive_summary": report.executive_summary if report else "",
            "fit_assessment": json.loads(report.fit_assessment) if report and report.fit_assessment else {},
            "strengths": json.loads(report.strengths) if report and report.strengths else [],
            "weaknesses": json.loads(report.weaknesses) if report and report.weaknesses else [],
            "skill_gaps": json.loads(report.skill_gaps) if report and report.skill_gaps else {},
            "action_plan": json.loads(report.action_plan) if report and report.action_plan else []
        } if report else {}
    }

    return context


@router.post("/chat/{session_id}", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    request: ChatMessageRequest,
    db: Session = Depends(get_session)
):
    """
    Send a message to the career coach chatbot.
    """
    # Verify session exists
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get chat history
    chat_history = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()

    history_list = [
        {"role": msg.role, "content": msg.content}
        for msg in chat_history[-20:]  # Last 20 messages
    ]

    # Get session context
    context = get_session_context(session_id, db)

    # Generate response
    try:
        response = await chatbot_service.chat(
            user_message=request.message,
            session_context=context,
            chat_history=history_list
        )

        # Save messages to database
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=request.message
        )
        db.add(user_msg)

        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response
        )
        db.add(assistant_msg)
        db.commit()

        # Get suggested followups
        report = context.get("report", {})
        context_manager = ChatSessionManager()
        suggestions = context_manager.get_suggested_followups(report, history_list)

        return ChatMessageResponse(
            role="assistant",
            content=response,
            suggested_followups=suggestions
        )

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/chat/{session_id}/stream")
async def stream_chat(
    session_id: str,
    message: str,
    db: Session = Depends(get_session)
):
    """
    Stream chat responses using SSE.
    """
    # Verify session
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get context and history
    context = get_session_context(session_id, db)

    chat_history = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()

    history_list = [
        {"role": msg.role, "content": msg.content}
        for msg in chat_history[-20:]
    ]

    async def event_generator():
        full_response = ""

        async for chunk in chatbot_service.chat_stream(
            user_message=message,
            session_context=context,
            chat_history=history_list
        ):
            full_response += chunk
            yield {"data": json.dumps({"chunk": chunk})}

        # Save messages after streaming
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=message
        )
        db.add(user_msg)

        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=full_response
        )
        db.add(assistant_msg)
        db.commit()

        yield {"data": json.dumps({"done": True})}

    return EventSourceResponse(event_generator())


@router.get("/chat/{session_id}/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    db: Session = Depends(get_session)
):
    """Get chat history for a session."""
    messages = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()

    message_list = [
        {
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in messages
    ]

    return ChatHistoryResponse(
        session_id=session_id,
        messages=message_list
    )


@router.get("/chat/{session_id}/suggestions")
async def get_suggestions(
    session_id: str,
    db: Session = Depends(get_session)
):
    """Get suggested follow-up questions for the session."""
    # Verify session
    session = db.exec(
        select(AnalysisSession).where(AnalysisSession.session_id == session_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get context
    context = get_session_context(session_id, db)

    # Get chat history
    chat_history = db.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()

    history_list = [
        {"role": msg.role, "content": msg.content}
        for msg in chat_history
    ]

    # Generate suggestions
    context_manager = ChatSessionManager()
    report = context.get("report", {})
    suggestions = context_manager.get_suggested_followups(report, history_list)

    return {"suggestions": suggestions}