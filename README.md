# AI Career Coach

A comprehensive, **free-to-run** AI-powered career coaching platform for students and early-career professionals. Upload your resume, paste a job description, and get honest strategic guidance — no paid API keys required.

> **Live Demo**: Deploy the frontend to [Vercel](https://vercel.com) in 2 clicks (see [Deployment](#deployment) below).

## What It Does

| Feature | Description |
|---|---|
| **Resume Analysis** | Upload PDF, DOCX, or TXT with intelligent parsing |
| **Job Fit Assessment** | Match score, key blockers, realistic timeline |
| **Strength Identification** | Evidence-based strengths with positioning tips |
| **Gap Analysis** | Technical gaps, evidence gaps, positioning gaps — with mitigation strategies |
| **Resume Rewrites** | Before/after bullet improvements with explanations |
| **Interview Prep** | Behavioral, technical, and role-specific questions with prep tips |
| **Alternative Paths** | Other roles that fit your profile with transition difficulty |
| **30-Day Action Plan** | Prioritized, week-by-week roadmap |
| **Interactive Coaching** | Chat with AI coach grounded in your report |

## Quick Start

### Prerequisites
- Python 3.9+ and pip
- Node.js 18+ and npm
- [Ollama](https://ollama.com) (free, local AI — **no API keys needed**)

### 1. Set Up Ollama (Free AI)

```bash
# Install from https://ollama.com, then:
ollama pull qwen3:8b       # For report generation
ollama pull llama3.2        # For chat (smaller, faster)
ollama serve                # Start the server
```

### 2. Start the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Defaults are already free-first
uvicorn app.main:app --reload --port 8000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Open the App

Go to **http://localhost:5173** and follow the guided flow:

1. Upload your resume
2. Paste the job description
3. Answer the intake questionnaire
4. Get your comprehensive report
5. Chat with your AI career coach

## Architecture

```
ai-career-coach/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/routes/      # REST endpoints (resume, analysis, chat)
│   │   ├── core/config.py   # Settings (free-first defaults)
│   │   ├── db/              # SQLite database setup
│   │   ├── models/          # SQLModel ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # AI providers, report generator, chatbot
│   │   └── utils/           # File parsing, job description parsing
│   ├── requirements.txt
│   └── .env.example         # Free-first configuration template
├── frontend/                # React + TypeScript + Tailwind v4
│   ├── src/
│   │   ├── hooks/           # useAnalysis, useChat
│   │   ├── pages/           # Landing, Analyze, Report (7 tabs), Chat
│   │   ├── services/api.ts  # Backend API client
│   │   └── types/           # TypeScript interfaces
│   ├── vercel.json          # SPA routing for Vercel deployment
│   └── package.json
└── README.md
```

## Configuration

### Default: Ollama (Free, Local, Private)

Out of the box, the app uses Ollama for both report generation and chat. **No API keys needed.**

```env
# backend/.env (these are the defaults)
REPORT_MODEL_PROVIDER=ollama
REPORT_MODEL_NAME=qwen3:8b
CHATBOT_PROVIDER=ollama
CHATBOT_MODEL_NAME=llama3.2
OLLAMA_BASE_URL=http://localhost:11434
```

### Optional: Paid APIs (Higher Quality Reports)

For higher quality report generation, you can optionally use a paid API:

```env
# OpenAI
REPORT_MODEL_PROVIDER=openai
REPORT_MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=your-key

# Anthropic
REPORT_MODEL_PROVIDER=anthropic
REPORT_MODEL_NAME=claude-3-haiku-20240307
ANTHROPIC_API_KEY=your-key
```

> **Tip**: Use a paid API for report generation and free Ollama for chat. Reports are generated once; chat is ongoing.

## Deployment

### Frontend → Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url/api`
7. Deploy ✅

The `vercel.json` in `frontend/` already handles SPA routing.

### Backend → Render (Free Tier)

1. Go to [render.com](https://render.com), create a new **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `pip install -r requirements.txt`
5. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add your environment variables from `.env.example`

> **Note**: Render's free tier spins down after inactivity. First request takes ~30s to cold-start.

## Design Decisions

### Gap Taxonomy
The system distinguishes between three types of gaps:
- **Skill gaps** — Skills you genuinely lack
- **Evidence gaps** — Skills you have but haven't demonstrated
- **Positioning gaps** — Skills present but poorly communicated

### Local-First AI
Default configuration uses Ollama for zero-cost, private inference. Sensitive career data never leaves your machine unless you opt into a paid API.

### Structured Reports
All reports are generated as structured JSON, enabling rich tabbed UI, export, and future analytics.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vite 8 |
| Backend | FastAPI, Python, SQLModel, SQLite |
| AI | Ollama (default), OpenAI, Anthropic (optional) |
| Deployment | Vercel (frontend), Render (backend) |

## API Documentation

With the backend running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## License

MIT License — free to use and modify.