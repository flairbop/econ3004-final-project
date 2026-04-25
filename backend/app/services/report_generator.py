"""
Career report generation service with comprehensive prompting.
"""
import json
import logging
import re
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
                temperature=settings.REPORT_TEMPERATURE,
                json_mode=True
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
            "ambitious": "Be encouraging but push them to aim high.",
            "realistic": "Be pragmatic. Focus on what is achievable now.",
            "balanced": "Balance ambition with realism."
        }
        tone_instruction = tone_map.get(guidance_tone, tone_map["balanced"])

        # Truncate texts to fit context window
        resume_snippet = resume_text[:2000] + "..." if len(resume_text) > 2000 else resume_text
        job_snippet = job_text[:1500] + "..." if len(job_text) > 1500 else job_text

        prompt = f"""You are an expert career strategist. Analyze this candidate against the target role.

TONE: {tone_instruction}
Be specific, reference their actual resume content. Be honest but supportive.

RESUME:
{resume_snippet}

JOB DESCRIPTION:
{job_snippet}

CANDIDATE INFO:
- Target: {intake.get('target_role', 'Not specified')}
- Year: {intake.get('year_in_school', 'Unknown')} / {intake.get('graduation_status', 'Unknown')}
- Major: {intake.get('major', 'Not specified')}
- Concerns: {intake.get('biggest_concern', 'Not specified')}
- Perceived Gaps: {intake.get('perceived_gaps', 'Not specified')}

Return ONLY a valid JSON object with this EXACT structure (no text before or after the JSON):

{{
  "executive_summary": "2-3 sentence strategic assessment",
  "fit_assessment": {{
    "current_alignment": "description of alignment",
    "competitiveness": "under-positioned/decently matched/strong match",
    "key_blockers": ["blocker1", "blocker2"],
    "realistic_timeline": "timeline estimate"
  }},
  "overall_match_score": 65,
  "strengths": [
    {{"strength": "name", "evidence": "from resume", "positioning_tip": "advice"}}
  ],
  "weaknesses": [
    {{"weakness": "name", "type": "skill_gap", "impact": "High", "mitigation": "how to fix"}}
  ],
  "skill_gaps": {{
    "technical_gaps": [{{"skill": "name", "importance": "Critical", "learnability": "timeframe", "resources": "where"}}],
    "soft_skill_gaps": [{{"skill": "name", "context": "why"}}],
    "experience_gaps": [{{"gap": "name", "alternative_evidence": "suggestion"}}],
    "evidence_gaps": [{{"missing_evidence": "what", "how_to_obtain": "how"}}]
  }},
  "resume_improvements": [
    {{"issue": "problem", "section": "where", "severity": "High", "suggestion": "fix"}}
  ],
  "rewritten_bullets": [
    {{"original": "weak bullet", "rewritten": "improved version", "section": "experience", "improvements": ["what changed"]}}
  ],
  "interview_questions": {{
    "behavioral": [{{"question": "q", "why_asked": "reason", "prep_tip": "tip"}}],
    "technical": [{{"question": "q", "why_asked": "reason", "prep_tip": "tip"}}],
    "role_specific": [{{"question": "q", "why_asked": "reason", "prep_tip": "tip"}}]
  }},
  "alternative_roles": [
    {{"role": "title", "fit_level": "High", "reason": "why", "transition_difficulty": "Easy"}}
  ],
  "action_plan": [
    {{"week": 1, "priority": "Must do", "action": "what", "details": "how", "estimated_time": "time"}},
    {{"week": 2, "priority": "Should do", "action": "what", "details": "how", "estimated_time": "time"}},
    {{"week": 3, "priority": "Should do", "action": "what", "details": "how", "estimated_time": "time"}},
    {{"week": 4, "priority": "Could do", "action": "what", "details": "how", "estimated_time": "time"}}
  ],
  "confidence_notes": ["any uncertainty notes"]
}}

Provide 2-4 items per array section. Keep descriptions concise (1-2 sentences each). Return ONLY the JSON object."""

        return prompt

    def _parse_report_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response into structured report data."""
        # Try multiple strategies to extract JSON from the response
        cleaned = response.strip()

        # Strategy 1: Remove markdown code fences
        if "```" in cleaned:
            # Extract content between code fences
            match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()

        # Strategy 2: Try direct parse
        data = self._try_parse_json(cleaned)
        if data is not None:
            return self._validate_report(data)

        # Strategy 3: Find the first { and last } to extract JSON object
        first_brace = cleaned.find('{')
        last_brace = cleaned.rfind('}')
        if first_brace != -1 and last_brace > first_brace:
            json_candidate = cleaned[first_brace:last_brace + 1]
            data = self._try_parse_json(json_candidate)
            if data is not None:
                return self._validate_report(data)

        # Strategy 4: Try brace-matching from the first {
        if first_brace != -1:
            data = self._extract_json_by_brace_matching(cleaned, first_brace)
            if data is not None:
                return self._validate_report(data)

        # Strategy 5: Progressively trim from the end to find valid JSON
        if first_brace != -1:
            candidate = cleaned[first_brace:]
            for trim in range(0, min(200, len(candidate)), 1):
                end = len(candidate) - trim
                if end <= first_brace:
                    break
                substr = candidate[:end]
                if substr.rstrip().endswith('}'):
                    data = self._try_parse_json(substr)
                    if data is not None:
                        return self._validate_report(data)

        # Strategy 6: Attempt to repair truncated JSON by closing open brackets/braces
        if first_brace != -1:
            repaired = self._repair_truncated_json(cleaned[first_brace:])
            if repaired is not None:
                data = self._try_parse_json(repaired)
                if data is not None:
                    logger.warning("Used JSON repair strategy for truncated response")
                    return self._validate_report(data)

        logger.error(f"Failed to parse report JSON after all strategies. Response length: {len(response)}, starts with: {response[:200]}")
        return self._create_fallback_report(response)

    def _try_parse_json(self, text: str) -> Dict[str, Any] | None:
        """Try to parse text as JSON, return None on failure."""
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except (json.JSONDecodeError, ValueError):
            pass
        return None

    def _extract_json_by_brace_matching(self, text: str, start: int) -> Dict[str, Any] | None:
        """Extract JSON object by matching braces."""
        depth = 0
        in_string = False
        escape_next = False
        for i in range(start, len(text)):
            char = text[i]
            if escape_next:
                escape_next = False
                continue
            if char == '\\':
                if in_string:
                    escape_next = True
                continue
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
            if in_string:
                continue
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    return self._try_parse_json(text[start:i + 1])
        return None

    def _repair_truncated_json(self, text: str) -> str | None:
        """Attempt to repair truncated JSON by closing open brackets/braces."""
        if not text or text[0] != '{':
            return None

        repaired = text.rstrip()

        # Strip trailing incomplete characters
        while repaired and repaired[-1] not in '{}[],:"0123456789nulltruefalse':
            repaired = repaired[:-1]

        if len(repaired) < 2:
            return None

        # Remove trailing comma
        if repaired.endswith(','):
            repaired = repaired[:-1]

        # Remove trailing colon + key (incomplete key-value pair)
        if repaired.endswith(':'):
            repaired = repaired[:-1].rstrip()
            if repaired.endswith('"'):
                key_start = repaired.rfind('"', 0, len(repaired) - 1)
                if key_start > 0:
                    repaired = repaired[:key_start].rstrip()
                    if repaired.endswith(','):
                        repaired = repaired[:-1]

        # Track open brackets/braces
        open_stack = []
        in_string = False
        escape_next = False

        for char in repaired:
            if escape_next:
                escape_next = False
                continue
            if char == '\\' and in_string:
                escape_next = True
                continue
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
            if in_string:
                continue
            if char == '{':
                open_stack.append('}')
            elif char == '[':
                open_stack.append(']')
            elif char in '}]':
                if open_stack and open_stack[-1] == char:
                    open_stack.pop()

        # Close unclosed string
        if in_string:
            repaired += '"'

        # Remove trailing comma after string closure
        stripped = repaired.rstrip()
        if stripped.endswith(','):
            repaired = stripped[:-1]

        # Close all open brackets/braces
        while open_stack:
            repaired += open_stack.pop()

        return repaired if len(repaired) > 2 else None

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