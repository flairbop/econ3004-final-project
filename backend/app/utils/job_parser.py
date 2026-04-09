"""
Job description parsing and analysis utilities.
"""
import re
from typing import Dict, List, Any, Optional


def parse_job_description(text: str) -> Dict[str, Any]:
    """
    Parse a job description and extract structured information.

    Args:
        text: Raw job description text

    Returns:
        Dictionary with structured job information
    """
    structure = {
        "title": None,
        "company": None,
        "required_skills": [],
        "preferred_skills": [],
        "responsibilities": [],
        "qualifications": [],
        "soft_skills": [],
        "tools_technologies": [],
        "level_expectations": None,
        "industry": None,
        "location": None,
        "employment_type": None,
    }

    text_lower = text.lower()
    lines = text.split('\n')

    # Try to extract job title (often in first few lines or after patterns)
    structure["title"] = extract_job_title(text, lines)
    structure["company"] = extract_company_name(text, lines)
    structure["location"] = extract_location(text)
    structure["employment_type"] = extract_employment_type(text_lower)
    structure["level_expectations"] = extract_level_expectations(text_lower)

    # Extract sections
    sections = identify_sections(text)

    # Parse requirements section
    if "requirements" in sections:
        req_text = sections["requirements"]
        structure["required_skills"] = extract_required_skills(req_text)
        structure["qualifications"] = extract_qualifications(req_text)

    # Parse preferred qualifications
    if "preferred" in sections:
        pref_text = sections["preferred"]
        structure["preferred_skills"] = extract_preferred_skills(pref_text)

    # Parse responsibilities
    if "responsibilities" in sections:
        structure["responsibilities"] = extract_responsibilities(sections["responsibilities"])
    elif "about" in sections:
        structure["responsibilities"] = extract_responsibilities(sections["about"])

    # Extract all skills using pattern matching
    all_skills = extract_all_skills(text)
    structure["tools_technologies"] = all_skills["tools"]
    structure["soft_skills"] = all_skills["soft"]

    # If required skills not found, infer from all skills
    if not structure["required_skills"]:
        structure["required_skills"] = all_skills["technical"]

    # Infer industry from content
    structure["industry"] = infer_industry(text_lower, structure["title"])

    return structure


def extract_job_title(text: str, lines: List[str]) -> Optional[str]:
    """Extract job title from job description."""
    # Common patterns for job titles
    title_patterns = [
        r'^([A-Za-z\s]+(?:Engineer|Developer|Analyst|Manager|Director|Specialist|'
        r'Coordinator|Assistant|Intern|Lead|Architect|Consultant|Designer)'
        r'(?:\s*\([^)]*\))?)',
        r'job title[:\s]+([^
]+)',
        r'position[:\s]+([^
]+)',
        r'we are (?:hiring|looking for)[:\s]+([^
]+)',
    ]

    # Try first few lines
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if line and len(line) < 100:
            # Check for common title words
            if any(word in line.lower() for word in [
                'engineer', 'analyst', 'manager', 'developer', 'intern',
                'coordinator', 'specialist', 'director', 'lead', 'architect',
                'consultant', 'designer', 'researcher', 'scientist', 'associate'
            ]):
                # Clean up the line
                title = re.sub(r'[\*\-#]', '', line).strip()
                if len(title) > 3:
                    return title

    # Try regex patterns on full text
    for pattern in title_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            title = match.group(1).strip()
            if len(title) > 3:
                return title

    return None


def extract_company_name(text: str, lines: List[str]) -> Optional[str]:
    """Extract company name from job description."""
    # Look for "at Company" patterns
    patterns = [
        r'at\s+([A-Z][A-Za-z0-9\s\-&]+)(?:\s|$)',
        r'company[:\s]+([^
]+)',
        r'^([A-Z][A-Za-z0-9\s\-&]+)\s+(?:is looking|seeks|hiring)',
        r'about\s+([A-Z][A-Za-z0-9\s\-&]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            company = match.group(1).strip()
            # Filter out common false positives
            if company.lower() not in ['the', 'a', 'an', 'we', 'us', 'our']:
                return company

    return None


def extract_location(text: str) -> Optional[str]:
    """Extract location information."""
    patterns = [
        r'location[:\s]+([^
]+)',
        r'(?:remote|hybrid|onsite|on-site)[,\s]*([A-Za-z\s,]+)',
        r'([A-Za-z\s]+,\s*(?:[A-Z]{2}|[A-Za-z]+))',  # City, ST or City, Country
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    # Check for remote/hybrid keywords
    text_lower = text.lower()
    if 'remote' in text_lower:
        return "Remote"
    elif 'hybrid' in text_lower:
        return "Hybrid"

    return None


def extract_employment_type(text: str) -> Optional[str]:
    """Extract employment type (full-time, part-time, internship)."""
    types = {
        'full-time': 'Full-time',
        'full time': 'Full-time',
        'part-time': 'Part-time',
        'part time': 'Part-time',
        'contract': 'Contract',
        'internship': 'Internship',
        'intern': 'Internship',
        'temporary': 'Temporary',
    }

    for key, value in types.items():
        if key in text:
            return value

    return None


def extract_level_expectations(text: str) -> Optional[str]:
    """Extract experience level expectations."""
    patterns = [
        r'(entry[-\s]?level|junior|associate|mid[-\s]?level|senior|staff|principal|lead)',
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'(?:minimum|at least)\s*(\d+)\s*years?',
    ]

    levels = []

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            levels.append(match.group(1))

    if levels:
        return ', '.join(levels)

    # Infer from context
    if 'entry' in text or 'junior' in text or '0-2' in text:
        return "Entry-level / Junior"
    elif 'senior' in text or '5+' in text or '7+' in text:
        return "Senior-level"
    elif 'mid' in text or '3-5' in text:
        return "Mid-level"

    return None


def identify_sections(text: str) -> Dict[str, str]:
    """Identify and extract sections from job description."""
    sections = {}

    # Common section headers
    section_patterns = {
        'requirements': r'(?:qualifications?|requirements?|what you["\']?ll need|must have|required)[\s:]*\n',
        'preferred': r'(?:preferred|nice to have|bonus|ideal|a plus)[\s:]*\n',
        'responsibilities': r'(?:responsibilities?|what you["\']?ll do|the role|job duties|day-to-day)[\s:]*\n',
        'about': r'(?:about\s*(?:the\s*role|us|company)|description|overview|position)[\s:]*\n',
        'benefits': r'(?:benefits?|perks|what we offer|compensation)[\s:]*\n',
    }

    # Split text by sections
    section_positions = []

    for section_name, pattern in section_patterns.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            section_positions.append((match.start(), section_name, match.end()))

    # Sort by position
    section_positions.sort()

    # Extract content between sections
    if section_positions:
        for i, (pos, name, end_pos) in enumerate(section_positions):
            if i + 1 < len(section_positions):
                next_pos = section_positions[i + 1][0]
                content = text[end_pos:next_pos].strip()
            else:
                content = text[end_pos:].strip()

            sections[name] = content

    return sections


def extract_required_skills(text: str) -> List[str]:
    """Extract required skills from text."""
    skills = []

    # Look for bullet points or listed items
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        # Remove bullet markers
        line = re.sub(r'^[\s•\-\*\◦]+', '', line)

        # Look for technical skills
        if any(indicator in line.lower() for indicator in [
            'experience with', 'proficiency in', 'knowledge of',
            'familiarity with', 'degree in', 'background in',
            'skills in', 'expertise in'
        ]):
            if len(line) > 10 and len(line) < 200:
                skills.append(line)

    return skills


def extract_preferred_skills(text: str) -> List[str]:
    """Extract preferred/bonus skills."""
    return extract_required_skills(text)  # Similar logic


def extract_qualifications(text: str) -> List[str]:
    """Extract qualification requirements."""
    qualifications = []

    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        line = re.sub(r'^[\s•\-\*\◦]+', '', line)

        # Look for degree requirements
        if re.search(r'\b(?:bachelor|master|phd|doctorate|degree|bs|ms|ba|ma)\b', line, re.IGNORECASE):
            qualifications.append(line)

        # Look for experience requirements
        if re.search(r'\d+\+?\s*years?', line, re.IGNORECASE):
            qualifications.append(line)

    return qualifications


def extract_responsibilities(text: str) -> List[str]:
    """Extract job responsibilities."""
    responsibilities = []

    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        line = re.sub(r'^[\s•\-\*\◦]+', '', line)

        if len(line) > 20 and len(line) < 300:
            # Look for action verbs
            if re.match(r'^(?:develop|build|design|create|manage|lead|collaborate|work|analyze|implement|maintain|support|conduct|oversee|coordinate)', line, re.IGNORECASE):
                responsibilities.append(line)

    return responsibilities


def extract_all_skills(text: str) -> Dict[str, List[str]]:
    """Extract all types of skills from job description."""
    text_lower = text.lower()

    # Technical skills database (subset)
    technical_skills = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
        'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'react', 'angular',
        'vue', 'node.js', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'spark',
        'hadoop', 'kafka', 'airflow', 'git', 'github', 'ci/cd', 'jenkins',
        'tableau', 'powerbi', 'excel', 'r', 'sas', 'spss', 'stata',
        'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
        'redis', 'elasticsearch', 'rabbitmq', 'graphql', 'rest api',
        'linux', 'unix', 'bash', 'shell scripting', 'powershell'
    ]

    # Soft skills
    soft_skills = [
        'communication', 'teamwork', 'leadership', 'problem solving',
        'critical thinking', 'time management', 'organization', 'adaptability',
        'collaboration', 'creativity', 'attention to detail', 'multitasking',
        'interpersonal', 'presentation', 'writing', 'analytical thinking',
        'self-motivated', 'initiative', 'flexibility', 'work independently'
    ]

    # Tools/technologies
    tools = [
        'jira', 'confluence', 'slack', 'trello', 'asana', 'notion',
        'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
        'vscode', 'intellij', 'pycharm', 'eclipse', 'vim',
        'office', 'word', 'excel', 'powerpoint', 'outlook',
        'salesforce', 'hubspot', 'workday', 'sap', 'oracle'
    ]

    found_technical = [s for s in technical_skills if s in text_lower]
    found_soft = [s for s in soft_skills if s in text_lower]
    found_tools = [s for s in tools if s in text_lower]

    return {
        "technical": found_technical,
        "soft": found_soft,
        "tools": found_tools
    }


def infer_industry(text_lower: str, title: Optional[str]) -> Optional[str]:
    """Infer industry from job description content."""
    industry_keywords = {
        'technology': ['software', 'saas', 'tech', 'startup', 'engineering', 'developer', 'full-stack', 'frontend', 'backend'],
        'finance': ['bank', 'financial', 'investment', 'trading', 'fintech', 'asset', 'portfolio', 'wealth'],
        'healthcare': ['health', 'medical', 'clinical', 'patient', 'healthcare', 'biotech', 'pharma'],
        'consulting': ['consulting', 'client', 'engagement', 'advisory', 'strategy'],
        'education': ['education', 'learning', 'student', 'academic', 'university', 'teaching'],
        'retail': ['retail', 'e-commerce', 'consumer', 'merchandising', 'store'],
        'media': ['media', 'content', 'entertainment', 'publishing', 'streaming'],
        'manufacturing': ['manufacturing', 'production', 'industrial', 'supply chain'],
    }

    for industry, keywords in industry_keywords.items():
        if any(kw in text_lower for kw in keywords):
            return industry

    # Infer from title
    if title:
        title_lower = title.lower()
        for industry, keywords in industry_keywords.items():
            if any(kw in title_lower for kw in keywords):
                return industry

    return "general"