"""
Contextual chatbot service with session grounding.
"""
import json
import logging
from typing import AsyncGenerator, List, Dict, Any, Optional
from datetime import datetime

from app.services.ai_providers import get_chatbot_provider
from app.core.config import settings

logger = logging.getLogger(__name__)


class ChatSessionManager:
    """Manages chat context and grounding for sessions."""

    def __init__(self):
        self.max_history = settings.MAX_CHAT_HISTORY

    def build_system_prompt(
        self,
        resume_text: str,
        resume_structure: Dict[str, Any],
        job_text: str,
        intake: Dict[str, Any],
        report: Dict[str, Any]
    ) -> str:
        """
        Build a comprehensive system prompt that grounds the chatbot
        in all session context.
        """
        # Summarize resume for context
        resume_summary = self._summarize_resume(resume_structure)

        # Summarize job
        job_title = report.get("fit_assessment", {}).get("target_role", "the target role")
        if not job_title or job_title == "Unknown":
            job_title = intake.get("target_role", "the target role")

        # Summarize key report insights
        strengths = [s.get("strength", "") for s in report.get("strengths", [])[:3]]
        blockers = report.get("fit_assessment", {}).get("key_blockers", [])

        system_prompt = f"""You are an AI Career Coach - a supportive, intelligent, and strategic mentor helping a candidate navigate their job search.

YOUR CONTEXT (use this to answer questions):

**CANDIDATE PROFILE:**
- Target Role: {intake.get('target_role', 'Unknown')}
- Background: {intake.get('major', 'Unknown')} / {intake.get('year_in_school', 'Unknown')}
- Confidence Level: {intake.get('confidence_level', 'Not specified')}
- Biggest Concern: {intake.get('biggest_concern', 'Not specified')}

**RESUME SUMMARY:**
{resume_summary}

**KEY STRENGTHS IDENTIFIED:**
{chr(10).join(f"- {s}" for s in strengths) if strengths else "Analysis in progress"}

**MAIN BLOCKERS:**
{chr(10).join(f"- {b}" for b in blockers) if blockers else "None identified"}

**GUIDANCE TONE:** {intake.get('guidance_tone', 'balanced')}

YOUR ROLE:
1. Answer questions based on the generated report and candidate materials
2. Help refine recommendations based on follow-up questions
3. Assist with trade-off decisions (e.g., "Should I focus on X or Y?")
4. Help rewrite resume bullets when requested
5. Suggest alternative strategies and paths
6. Prioritize actions when asked "what should I do first?"
7. Be conversational but professional

IMPORTANT RULES:
- Always ground responses in the candidate's actual resume and report
- Do NOT invent qualifications or achievements
- Be honest about uncertainty when appropriate
- Provide actionable, specific advice (not generic platitudes)
- Distinguish between "you lack this skill" vs "you haven't shown evidence of this skill"
- If asked about topics outside the scope of this career analysis, gently redirect to career topics
- Maintain a supportive, mentor-like tone

When rewriting resume bullets:
- Preserve truthfulness
- Use strong action verbs
- Add placeholders like "[add metric]" for missing quantification
- Focus on impact and outcomes
- Keep bullets concise (1-2 lines)

When suggesting next steps:
- Consider their timeline constraints
- Prioritize high-impact actions
- Account for their confidence level and concerns"""

        return system_prompt

    def _summarize_resume(self, structure: Dict[str, Any]) -> str:
        """Create a brief summary of resume structure."""
        parts = []

        if structure.get("name"):
            parts.append(f"Name: {structure['name']}")

        edu = structure.get("education", [])
        if edu:
            if isinstance(edu[0], dict):
                parts.append(f"Education: {len(edu)} entries")
            else:
                parts.append(f"Education: {len(edu)} lines")

        exp = structure.get("experience", [])
        if exp:
            parts.append(f"Experience: {len(exp)} entries")

        proj = structure.get("projects", [])
        if proj:
            parts.append(f"Projects: {len(proj)} entries")

        skills = structure.get("skills", [])
        if skills:
            parts.append(f"Skills: {len(skills)} listed ({', '.join(skills[:5])}...)")

        return " | ".join(parts) if parts else "Resume structure unclear"

    def build_chat_prompt(
        self,
        system_prompt: str,
        chat_history: List[Dict[str, Any]],
        user_message: str
    ) -> str:
        """Build the complete prompt for chat generation."""
        # Format chat history
        history_str = ""
        for msg in chat_history[-self.max_history:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            history_str += f"\n{role.upper()}: {content}\n"

        # Build the full prompt
        prompt = f"""{system_prompt}

---

CONVERSATION HISTORY:{history_str}

USER: {user_message}

ASSISTANT:"""

        return prompt

    def get_suggested_followups(self, report: Dict[str, Any], chat_history: List[Dict[str, Any]]) -> List[str]:
        """Generate context-aware suggested follow-up questions."""
        suggestions = [
            "What should I improve first?",
            "Am I targeting the right role?",
            "What jobs am I more realistic for?",
            "How should I explain my experience in interviews?",
        ]

        # Add contextual suggestions based on report
        weaknesses = report.get("weaknesses", [])
        if any(w.get("type") == "skill_gap" for w in weaknesses):
            suggestions.append("Which missing skill matters most?")

        rewritten = report.get("rewritten_bullets", [])
        if rewritten:
            suggestions.append("Can you rewrite my weakest bullet?")

        skill_gaps = report.get("skill_gaps", {})
        if skill_gaps.get("technical_gaps"):
            suggestions.append("Do I really need all these technical skills?")

        # Add user's perceived gaps
        perceived = report.get("intake", {}).get("perceived_gaps", "")
        if "project" in str(perceived).lower():
            suggestions.append("What projects should I build next?")

        # Deduplicate and limit
        seen = set()
        unique = []
        for s in suggestions:
            if s not in seen:
                unique.append(s)
                seen.add(s)
                if len(unique) >= 5:
                    break

        return unique


class ChatbotService:
    """Main chatbot service using local/remote AI providers."""

    def __init__(self):
        self.provider = get_chatbot_provider()
        self.context_manager = ChatSessionManager()

    async def chat(
        self,
        user_message: str,
        session_context: Dict[str, Any],
        chat_history: List[Dict[str, Any]]
    ) -> str:
        """
        Generate a chat response with full context grounding.
        """
        # Build system prompt with all context
        system_prompt = self.context_manager.build_system_prompt(
            resume_text=session_context.get("resume_text", ""),
            resume_structure=session_context.get("resume_structure", {}),
            job_text=session_context.get("job_text", ""),
            intake=session_context.get("intake", {}),
            report=session_context.get("report", {})
        )

        # Build complete prompt
        prompt = self.context_manager.build_chat_prompt(
            system_prompt=system_prompt,
            chat_history=chat_history,
            user_message=user_message
        )

        # Generate response
        try:
            response = await self.provider.generate(
                prompt=prompt,
                max_tokens=settings.MAX_CHAT_TOKENS,
                temperature=settings.CHAT_TEMPERATURE
            )

            # Clean up response
            response = response.strip()
            if response.startswith("ASSISTANT:"):
                response = response[10:].strip()

            return response

        except Exception as e:
            logger.error(f"Chat generation failed: {e}")
            if "ollama" in str(e).lower():
                return (
                    "I apologize, but I'm having trouble connecting to the local AI model. "
                    "Please ensure Ollama is running with: `ollama serve` and that the model "
                    f"'{settings.CHATBOT_MODEL_NAME}' is available. Run: `ollama pull {settings.CHATBOT_MODEL_NAME}`"
                )
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."

    async def chat_stream(
        self,
        user_message: str,
        session_context: Dict[str, Any],
        chat_history: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        """
        Generate a streaming chat response.
        """
        # Build system prompt with all context
        system_prompt = self.context_manager.build_system_prompt(
            resume_text=session_context.get("resume_text", ""),
            resume_structure=session_context.get("resume_structure", {}),
            job_text=session_context.get("job_text", ""),
            intake=session_context.get("intake", {}),
            report=session_context.get("report", {})
        )

        # Build complete prompt
        prompt = self.context_manager.build_chat_prompt(
            system_prompt=system_prompt,
            chat_history=chat_history,
            user_message=user_message
        )

        # Generate streaming response
        try:
            async for chunk in self.provider.generate_stream(
                prompt=prompt,
                max_tokens=settings.MAX_CHAT_TOKENS,
                temperature=settings.CHAT_TEMPERATURE
            ):
                yield chunk

        except Exception as e:
            logger.error(f"Chat streaming failed: {e}")
            yield f"Error: {str(e)}"


# Global instance
chatbot_service = ChatbotService()