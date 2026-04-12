# AI Career Coach — Usage Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
3. [Understanding Your Report](#understanding-your-report)
4. [Chatting with Your Coach](#chatting-with-your-coach)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Tips for Best Results](#tips-for-best-results)
8. [Deployment](#deployment)

---

## Getting Started

### Prerequisites

| Requirement | Why |
|---|---|
| Python 3.9+ | Backend server |
| Node.js 18+ | Frontend build |
| [Ollama](https://ollama.com) | Free local AI (no API keys needed) |

### Quick Install

```bash
# 1. Set up Ollama (free AI)
ollama pull qwen3:8b && ollama pull llama3.2

# 2. Start backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# 3. Start frontend (new terminal)
cd frontend
npm install && cp .env.example .env
npm run dev
```

Open **http://localhost:5173** — that's it.

> **No API keys are needed.** The app defaults to Ollama, which runs free on your machine.

---

## Step-by-Step Walkthrough

### Step 1: Landing Page

Navigate to http://localhost:5173. You'll see the hero section with an overview of features and a "Get Started" button.

### Step 2: Upload Your Resume

Click **Get Started** → upload your resume.

- **Supported formats**: PDF, DOCX, TXT (max 10MB)
- Wait for parsing to complete (green checkmark)
- Review any warnings (e.g., "very little text extracted" for image-based PDFs)

> **Tip**: Text-based PDFs work best. Scanned images won't extract well.

### Step 3: Paste the Job Description

Paste the **complete** job description for your target role. Include:
- Job title and company
- Required and preferred qualifications
- Responsibilities
- Any skills/tools mentioned

> The more detail you provide, the better the analysis.

### Step 4: Complete the Intake Form

Answer questions about your background:

| Field | What to Enter |
|---|---|
| Target Role | The specific job title you're applying for |
| Alternative Roles | Other positions you'd consider |
| Year in School | Your current academic year |
| Major | Your area of study |
| Industries | Sectors you're interested in |
| Confidence Level | How confident you feel about this application (1–10) |
| Biggest Concern | What worries you most about applying |
| Perceived Gaps | Skills you think you're missing |
| Strengths | What you want employers to know about you |
| Guidance Tone | Ambitious, Realistic, or Balanced |

### Step 5: Generate Your Report

Click **Generate Analysis**. Processing takes 30–60 seconds depending on your hardware and model.

### Step 6: Chat with Your Coach

After reading your report, click **Chat with Coach** for follow-up guidance.

---

## Understanding Your Report

Your report has **7 tabs**, each serving a specific purpose:

### Summary
- **Executive Summary**: High-level overview of your position
- **Fit Assessment**: Current alignment, competitiveness, key blockers, realistic timeline
- **Match Score**: Percentage indicating how competitive you are
- **Confidence Notes**: Caveats about what the analysis can and can't assess

### Strengths
Each strength includes:
- **Evidence**: How your resume demonstrates this strength
- **Positioning Tip**: How to better leverage it in applications

### Gaps
Three types of gaps are identified:
- **Skill gaps** — Skills you genuinely lack (with learning resources)
- **Evidence gaps** — Skills you have but haven't shown on your resume
- **Positioning gaps** — Skills present but poorly communicated

Each gap is rated by **impact** (high/medium/low) and includes **mitigation strategies**.

### Resume Tips
- **Issues**: Specific problems with severity ratings
- **Bullet Rewrites**: Side-by-side before/after comparisons with explanations

### Interview Prep
Questions organized by category:
- **Behavioral**: "Tell me about a time when..." questions
- **Technical**: Skills and knowledge questions
- **Role-Specific**: Questions tailored to the target position

Each includes **why it's asked** and a **preparation tip**.

### Alternatives
Other career paths that match your profile, each with:
- Fit level (high/medium/low)
- Why it's a good fit for you
- Transition difficulty

### 30-Day Plan
A week-by-week roadmap with prioritized actions:
- **Must do**: Critical, non-negotiable tasks
- **Should do**: Important but flexible
- **Nice to do**: Bonus improvements

Each step includes estimated time and expected outcome.

---

## Chatting with Your Coach

The AI career coach is grounded in your resume, job description, and report. It won't give generic advice — everything is personalized.

### Good Questions to Ask

```
"What should I improve first?"
"Am I aiming too high for this role?"
"Can you rewrite my weakest bullet point?"
"What projects should I build to fill my gaps?"
"Which missing skill will have the biggest impact?"
"How should I explain my internship gap?"
"Should I focus on technical skills or networking?"
"What could I accomplish in the next two weeks?"
```

### Less Effective Questions

- Too vague: "Help me" — be specific
- Off-topic: Questions unrelated to your career materials
- Expectations: The coach advises; it doesn't apply to jobs for you

---

## Configuration

### AI Providers

The app defaults to **Ollama (free, local)** for everything.

| Provider | Cost | Best For | Setup |
|---|---|---|---|
| Ollama | Free | Default, privacy-focused | `ollama pull qwen3:8b` |
| OpenAI | Paid | Higher quality reports | Set `OPENAI_API_KEY` in `.env` |
| Anthropic | Paid | Higher quality reports | Set `ANTHROPIC_API_KEY` in `.env` |

### Recommended Ollama Models

| Model | Size | Speed | Quality | Use Case |
|---|---|---|---|---|
| `llama3.2` | 2GB | Fast | Good | Chat |
| `qwen3:8b` | 5GB | Medium | Very Good | Reports |
| `mistral` | 4GB | Medium | Good | All-around |

---

## Troubleshooting

### "Ollama connection refused"
```bash
# Make sure Ollama is running
ollama serve

# Verify model is available
ollama list

# Pull if missing
ollama pull llama3.2
```

### "No text extracted" from resume
- Your PDF is likely scanned images, not selectable text
- Try a `.docx` or `.txt` version instead
- Use OCR software to convert first

### Frontend won't load
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend crashes on startup
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Reset database if needed
rm app.db
uvicorn app.main:app --reload --port 8000
```

### CORS errors in browser
- Ensure the backend is running on port 8000
- Check `VITE_API_URL` in `frontend/.env` matches your backend URL
- For deployed setups, add your frontend URL to `BACKEND_CORS_ORIGINS` in `backend/.env`

---

## Tips for Best Results

### Resume Preparation
1. Use clear section headers (Education, Experience, Skills, Projects)
2. Use bullet points, not paragraphs
3. Quantify achievements: "Increased X by Y%"
4. Use action verbs: Led, Built, Designed, Managed
5. Save as text-based PDF for best parsing

### Job Description
- Paste the **full** description, not just the title
- Include requirements, preferred qualifications, and responsibilities
- Company context helps the analysis

### Iterative Process
1. Get your first report → implement "quick win" suggestions
2. Update your resume → re-analyze
3. Compare improvement over time
4. Use the chat to refine strategy between analyses

---

## Deployment

### Frontend → Vercel (Free)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** → `frontend`
4. Set **Build Command** → `npm run build`
5. Set **Output Directory** → `dist`
6. Set env var: `VITE_API_URL=https://your-backend-url/api`

### Backend → Render (Free Tier)

1. Create Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Set **Root Directory** → `backend`
4. Set **Start Command** → `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Exporting Your Report

On the Report page, click **Export** to download a Markdown file with all sections. This is useful for:
- Sharing with a real career advisor
- Tracking your progress over time
- Printing for reference

---

## Privacy

| Mode | Data Handling |
|---|---|
| Ollama (default) | Everything stays on your machine |
| Paid APIs | Resume/job text sent to OpenAI/Anthropic for report generation only |

Your data is stored in a local SQLite file (`backend/app.db`). Delete it to remove all data.