# AI Career Coach

A comprehensive AI-powered career coaching platform for students and early-career professionals. This application provides strategic career analysis, resume improvement suggestions, interview preparation, and personalized coaching through an interactive chat interface.

## Features

### Core Capabilities
- **Resume Analysis**: Upload PDF, DOCX, or TXT files with intelligent parsing
- **Job Matching**: Analyze your fit for target roles with detailed assessments
- **Strategic Report**: Comprehensive career analysis including:
  - Executive summary and fit assessment
  - Strength identification with positioning tips
  - Honest gap analysis (technical, soft skills, experience, evidence gaps)
  - Resume bullet rewrites with explanations
  - Interview question preparation
  - Alternative career path suggestions
  - 30-day action plan
- **Interactive Coaching**: Chat with AI coach grounded in your report

### Technical Features
- Modern React + TypeScript frontend with Tailwind CSS
- FastAPI Python backend with SQLite persistence
- Local LLM support via Ollama (zero-cost chatbot)
- Optional external AI APIs for report generation
- Structured data extraction from resumes and job descriptions

## Architecture

```
ai-career-coach/
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes/   # REST API endpoints
│   │   ├── core/         # Configuration
│   │   ├── db/           # Database setup
│   │   ├── models/       # SQLModel database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic (AI providers, report gen)
│   │   └── utils/        # Utilities (file parsing, job parsing)
│   └── requirements.txt
├── frontend/             # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- (Optional) Ollama for local LLM inference

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and preferences
```

5. Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Configuration

### AI Model Setup

#### Option 1: Local Chatbot (Zero Cost) - Recommended

1. Install Ollama: https://ollama.com

2. Pull a model:
```bash
ollama pull llama3.2
```

3. Start Ollama:
```bash
ollama serve
```

4. Configure `.env`:
```env
CHATBOT_PROVIDER=ollama
CHATBOT_MODEL_NAME=llama3.2
```

#### Option 2: External APIs (Report Generation)

For higher quality report generation, configure an external API:

```env
REPORT_MODEL_PROVIDER=openai
REPORT_MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=your-key-here
```

Or for Anthropic:

```env
REPORT_MODEL_PROVIDER=anthropic
REPORT_MODEL_NAME=claude-3-haiku-20240307
ANTHROPIC_API_KEY=your-key-here
```

## Usage

1. **Upload Resume**: Start by uploading your resume (PDF, DOCX, or TXT)

2. **Paste Job Description**: Paste the job description for your target role

3. **Answer Questions**: Complete the intake questionnaire about your background, goals, and concerns

4. **Review Report**: Get a comprehensive analysis with actionable recommendations

5. **Chat with Coach**: Ask follow-up questions, explore alternatives, and refine your strategy

## Key Design Decisions

### Distinguishing Skill Gaps from Evidence Gaps
The system differentiates between:
- **Actual skill gaps**: Skills you genuinely lack
- **Evidence gaps**: Skills you have but haven't demonstrated on your resume
- **Positioning gaps**: Skills present but poorly communicated

This distinction helps prioritize the most impactful improvements.

### Local LLM for Chat
The follow-up chatbot uses local inference (Ollama) by default to provide:
- Zero ongoing cost
- Privacy for sensitive career discussions
- Low latency for interactive coaching

### Structured Report Output
Reports are generated in structured JSON format, enabling:
- Rich, tabbed UI presentation
- Export to various formats
- Future extensibility and analytics

## Development

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

### API Documentation

With the backend running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database

The application uses SQLite by default. The database file (`app.db`) is created automatically on first run.

To inspect the database:
```bash
sqlite3 backend/app.db
.tables
.schema
```

## Future Enhancements

- [ ] User authentication and saved sessions
- [ ] Multi-report comparison view
- [ ] Advisor dashboard for career counselors
- [ ] PDF export of reports
- [ ] Resume template suggestions
- [ ] Cover letter generation
- [ ] Application tracking integration

## License

MIT License - feel free to use and modify for your needs.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues or questions:
- Open a GitHub issue
- Check the API documentation at `/docs`
- Review the example configuration in `.env.example`