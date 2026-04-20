"""
Career report generation service with comprehensive prompting.
"""
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.services.ai_providers import get_report_provider
from app.core.config import settings

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generates comprehensive career analysis reports."""

    def __init__(self):
        self.provider = get_report_provider()

    async def generate_report(
        self,
        resume_text: str,
        resume_structure: Dict[str, Any],
        job_text: str,
        job_structure: Dict[str, Any],
        intake: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a complete career analysis report.
        """
        # Build the comprehensive prompt
        prompt = self._build_analysis_prompt(
            resume_text, resume_structure, job_text, job_structure, intake
        )

        # Generate the report
        try:
            response = await self.provider.generate(
                prompt=prompt,
                max_tokens=settings.MAX_REPORT_TOKENS,
                temperature=settings.REPORT_TEMPERATURE
            )

            # Parse the structured response
            report_data = self._parse_report_response(response)
            report_data["created_at"] = datetime.utcnow().isoformat()

            return report_data

        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            raise

    def _build_analysis_prompt(
        self,
        resume_text: str,
        resume_structure: Dict[str, Any],
        job_text: str,
        job_structure: Dict[str, Any],
        intake: Dict[str, Any]
    ) -> str:
        """Build the comprehensive analysis prompt."""

        guidance_tone = intake.get("guidance_tone", "balanced")
        tone_map = {
            "ambitious": "Be encouraging but realistic about growth potential. Push the user to aim high while being honest about gaps.",
            "realistic": "Be pragmatic and grounded. Focus on what is achievable now and concrete steps forward.",
            "balanced": "Balance ambition with realism. Acknowledge both strengths and gaps fairly."
        }
        tone_instruction = tone_map.get(guidance_tone, tone_map["balanced"])

        # Truncate texts if too long (reduced limits to avoid Groq 413 errors)
        resume_snippet = resume_text[:2000] + "..." if len(resume_text) > 2000 else resume_text
        job_snippet = job_text[:1500] + "..." if len(job_text) > 1500 else job_text

        # Truncate JSON structures to avoid payload limits
        def truncate_dict(d: Dict, max_keys: int = 5) -> Dict:
            """Truncate dictionary to avoid large payloads."""
            if isinstance(d, dict):
                truncated = {}
                for i, (k, v) in enumerate(d.items()):
                    if i >= max_keys:
                        break
                    truncated[k] = truncate_dict(v, max_keys) if isinstance(v, dict) else v
                return truncated
            return d

        resume_struct_truncated = truncate_dict(resume_structure, max_keys=8)
        job_struct_truncated = truncate_dict(job_structure, max_keys=5)

        prompt = f"""You are an expert career strategist and mentor specializing in helping college students and early-career professionals navigate job searches.

YOUR TASK: Analyze this candidate's profile against the target role and provide a comprehensive, structured career coaching report.

IMPORTANT GUIDELINES:
- {tone_instruction}
- Be SPECIFIC, not generic. Reference actual content from their resume and the job description.
- Distinguish between actual skill gaps vs. evidence gaps vs. weak positioning.
- Do NOT invent achievements or metrics. Use placeholders like "[add metric if true]" if needed.
- Be HONEST but SUPPORTIVE. Never shame the candidate.
- Focus on ACTIONABLE recommendations, not vague advice.
- IMPORTANT: Provide your response as a valid JSON object with the exact structure specified below.

---

CANDIDATE RESUME:
{resume_snippet}

PARSED RESUME STRUCTURE:
{json.dumps(resume_struct_truncated, indent=2)}

---

TARGET JOB DESCRIPTION:
{job_snippet}

PARSED JOB STRUCTURE:
{json.dumps(job_struct_truncated, indent=2)}

---

INTAKE QUESTIONNAIRE RESPONSES:
- Target Role: {intake.get('target_role', 'Not specified')}
- Alternative Roles: {intake.get('alternative_roles', 'None specified')}
- Year/Status: {intake.get('year_in_school', 'Unknown')} / {intake.get('graduation_status', 'Unknown')}
- Major/Background: {intake.get('major', 'Not specified')}
- Industries of Interest: {intake.get('industries', 'Not specified')}
- Confidence Level: {intake.get('confidence_level', 'Not specified')}
- Biggest Concern: {intake.get('biggest_concern', 'Not specified')}
- Perceived Gaps: {intake.get('perceived_gaps', 'Not specified')}
- Strengths They Want Highlighted: {intake.get('strengths', 'Not specified')}
- Preferred Guidance: {intake.get('guidance_tone', 'balanced')}

---

Generate a JSON response with this exact structure:

{{
  "executive_summary": "A 2-3 paragraph strategic assessment of their current position relative to the role, competitiveness, and key blockers.",

  "fit_assessment": {{
    "current_alignment": "How well their background matches the role requirements",
    "competitiveness": "Assessment of whether they are under-positioned, decently matched, or underqualified",
    "key_blockers": ["List 2-4 main obstacles"],
    "realistic_timeline": "How long until they'd be competitive"
  }},

  "overall_match_score": 65,

  "strengths": [
    {{
      "strength": "Specific strength",
      "evidence": "What in their resume demonstrates this",
      "positioning_tip": "How to highlight this better"
    }}
  ],

  "weaknesses": [
    {{
      "weakness": "Specific gap or concern",
      "type": "skill_gap|evidence_gap|positioning_gap|experience_gap",
      "impact": "High/Medium/Low - how much this matters",
      "mitigation": "How to address or compensate for this"
    }}
  ],

  "skill_gaps": {{
    "technical_gaps": [
      {{
        "skill": "Missing technical skill",
        "importance": "Critical/Recommended/Nice-to-have",
        "learnability": "How quickly this can be learned",
        "resources": "Where to learn this"
      }}
    ],
    "soft_skill_gaps": [{{"skill": "...", "context": "..."}}],
    "experience_gaps": [{{"gap": "...", "alternative_evidence": "..."}}],
    "evidence_gaps": [{{"missing_evidence": "...", "how_to_obtain": "..."}}]
  }},

  "resume_improvements": [
    {{
      "issue": "What's wrong",
      "section": "Which resume section",
      "severity": "High/Medium/Low",
      "suggestion": "Specific fix to make"
    }}
  ],

  "rewritten_bullets": [
    {{
      "original": "Original weak bullet",
      "rewritten": "Stronger version - truthful but impactful",
      "section": "experience|projects|education",
      "improvements": ["List what was improved"]
    }}
  ],

  "interview_questions": {{
    "behavioral": [
      {{
        "question": "Likely behavioral question",
        "why_asked": "Why this might be asked based on their profile",
        "prep_tip": "How to prepare"
      }}
    ],
    "technical": [{{"question": "...", "why_asked": "...", "prep_tip": "..."}}],
    "role_specific": [{{"question": "...", "why_asked": "...", "prep_tip": "..."}}]
  }},

  "alternative_roles": [
    {{
      "role": "Alternative job title",
      "fit_level": "High/Medium/Low",
      "reason": "Why this might be a better or more realistic fit",
      "transition_difficulty": "Easy/Moderate/Difficult"
    }}
  ],

  "action_plan": [
    {{
      "week": 1,
      "priority": "Must do/Should do/Could do",
      "action": "Specific action item",
      "details": "How to complete this",
      "estimated_time": "Time required",
      "outcome": "What success looks like"
    }}
  ],

  "confidence_notes": [
    "Areas where the analysis has uncertainty and why"
  ]
}}

IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting, explanations, or other text outside the JSON structure."""

        return prompt

    def _parse_report_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response into structured report data."""
        # Try to extract JSON from the response
        try:
            # Remove any markdown code blocks if present
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]

            cleaned = cleaned.strip()
            data = json.loads(cleaned)

            # Validate required fields and set defaults
            return self._validate_report(data)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse report JSON: {e}")
            # Return a minimal valid structure
            return self._create_fallback_report(response)

    def _validate_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize report structure."""
        # Ensure all required fields exist
        defaults = {
            "executive_summary": "Report generation encountered an issue. Please try again.",
            "fit_assessment": {
                "current_alignment": "Unable to assess",
                "competitiveness": "Unknown",
                "key_blockers": ["Analysis incomplete"],
                "realistic_timeline": "Unknown"
            },
            "overall_match_score": None,
            "strengths": [],
            "weaknesses": [],
            "skill_gaps": {
                "technical_gaps": [],
                "soft_skill_gaps": [],
                "experience_gaps": [],
                "evidence_gaps": []
            },
            "resume_improvements": [],
            "rewritten_bullets": [],
            "interview_questions": {
                "behavioral": [],
                "technical": [],
                "role_specific": []
            },
            "alternative_roles": [],
            "action_plan": [],
            "confidence_notes": ["Report structure may be incomplete."]
        }

        # Merge with defaults
        for key, default_value in defaults.items():
            if key not in data or data[key] is None:
                data[key] = default_value

        return data

    def _create_fallback_report(self, raw_response: str) -> Dict[str, Any]:
        """Create a fallback report when parsing fails."""
        return {
            "executive_summary": f"The analysis report was generated but had formatting issues. Here's the raw analysis:\n\n{raw_response[:1000]}...",
            "fit_assessment": {
                "current_alignment": "Unable to parse structured assessment",
                "competitiveness": "Unknown",
                "key_blockers": ["Report parsing error"],
                "realistic_timeline": "Unknown"
            },
            "overall_match_score": None,
            "strengths": [],
            "weaknesses": [{"weakness": "Report parsing error - please retry", "type": "system", "impact": "Low", "mitigation": "Regenerate the report"}],
            "skill_gaps": {"technical_gaps": [], "soft_skill_gaps": [], "experience_gaps": [], "evidence_gaps": []},
            "resume_improvements": [],
            "rewritten_bullets": [],
            "interview_questions": {"behavioral": [], "technical": [], "role_specific": []},
            "alternative_roles": [],
            "action_plan": [],
            "confidence_notes": ["The report could not be fully parsed. Consider regenerating or contacting support."]
        }


# Global instance
report_generator = ReportGenerator()