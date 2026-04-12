# AI Career Coach - Usage Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Using the Application](#using-the-application)
3. [Configuration Options](#configuration-options)
4. [Troubleshooting](#troubleshooting)
5. [Tips for Best Results](#tips-for-best-results)

## Quick Start

### Prerequisites

- **Python 3.9+** and **pip**
- **Node.js 18+** and **npm**
- **Git** (optional, for cloning)

### Installation

1. **Clone or navigate to the project:**
```bash
cd ai-career-coach
```

2. **Run the startup script:**
```bash
./start.sh
```

This will:
- Install Python dependencies
- Install Node.js dependencies
- Start the backend on http://localhost:8000
- Start the frontend on http://localhost:5173

3. **Open your browser** and go to http://localhost:5173

### Manual Setup (if startup script fails)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Using the Application

### Step 1: Landing Page

Navigate to http://localhost:5173 to see the landing page with:
- Overview of features
- How it works
- Call-to-action to start analysis

### Step 2: Upload Your Resume

Click "Get Started" and:
1. Upload your resume (PDF, DOCX, or TXT, max 10MB)
2. Wait for parsing to complete
3. Review any parsing warnings

**Tips:**
- Ensure text is selectable (not scanned images)
- Use standard section headers (Education, Experience, etc.)

### Step 3: Paste Job Description

Paste the complete job description for your target role:
- Company name and role title
- Requirements and qualifications
- Responsibilities
- Preferred skills

### Step 4: Complete Intake Form

Answer questions about:
- **Target Role**: The specific job title you're aiming for
- **Alternative Roles**: Other positions you'd consider
- **Year/Major**: Your academic background
- **Industries**: Sectors you're interested in
- **Confidence Level**: How confident you feel (1-10)
- **Biggest Concern**: What worries you most
- **Perceived Gaps**: Skills you think you're missing
- **Strengths**: What you want employers to know
- **Guidance Tone**: Ambitious, Realistic, or Balanced

### Step 5: Generate Report

Click "Generate Analysis" and wait 30-60 seconds.

The report includes:
- Executive summary
- Fit assessment with match score
- Strengths with positioning tips
- Weaknesses and gaps analysis
- Resume improvement suggestions
- Rewritten bullet examples
- Interview question preparation
- Alternative career paths
- 30-day action plan

### Step 6: Chat with Your Coach

After viewing your report, click "Chat with Coach" to:
- Ask follow-up questions
- Get clarification on recommendations
- Explore alternative paths
- Rewrite specific bullets
- Prioritize next steps

**Example Questions:**
- "What should I improve first?"
- "Am I aiming too high for this role?"
- "Can you rewrite my weakest bullet?"
- "What projects should I build next?"
- "Which missing skill matters most?"

## Configuration Options

### AI Model Configuration

The application supports multiple AI providers for different use cases:

#### Option 1: Zero-Cost Setup (Recommended for Chat)

**Ollama (Local LLM) for Chat:**

1. Install Ollama from https://ollama.com

2. Pull a model (recommendations):
```bash
# Small, fast model
ollama pull llama3.2

# Better quality
ollama pull mistral

# Best quality (larger)
ollama pull llama3.1
```

3. Start Ollama:
```bash
ollama serve
```

4. Configure `backend/.env`:
```env
CHATBOT_PROVIDER=ollama
CHATBOT_MODEL_NAME=llama3.2
OLLAMA_BASE_URL=http://localhost:11434
```

**Benefits:**
- Completely free
- Private (data stays on your machine)
- Fast response times
- No API rate limits

#### Option 2: External APIs for Report Generation

For higher quality report generation, use an external API:

**OpenAI:**
```env
REPORT_MODEL_PROVIDER=openai
REPORT_MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=your-openai-key-here
```

**Anthropic:**
```env
REPORT_MODEL_PROVIDER=anthropic
REPORT_MODEL_NAME=claude-3-haiku-20240307
ANTHROPIC_API_KEY=your-anthropic-key-here
```

**Benefits:**
- Higher quality structured output
- Better at following complex instructions
- More consistent formatting

#### Option 3: Mixed Setup (Recommended for Production)

Use external API for report generation (one-time cost) and local Ollama for chat (free ongoing):

```env
# For comprehensive report (paid, one-time)
REPORT_MODEL_PROVIDER=openai
REPORT_MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=your-key

# For chat (free, ongoing)
CHATBOT_PROVIDER=ollama
CHATBOT_MODEL_NAME=llama3.2
```

### Frontend Configuration

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

Change if your backend runs on a different port.

## Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Database errors:**
- Delete `backend/app.db` to reset the database
- The database will be recreated on next startup

**AI provider connection errors:**
- Check that your API keys are set in `.env`
- For Ollama, ensure it's running: `ollama serve`
- Verify model is pulled: `ollama list`

### Frontend Issues

**"Cannot find module" errors:**
```bash
cd frontend
rm -rf node_modules
npm install
```

**API connection errors:**
- Check that backend is running on port 8000
- Verify `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### File Upload Issues

**"Unsupported file format":**
- Only PDF, DOCX, and TXT are supported
- Check file extension

**"No text extracted":**
- File may be scanned images (not text-based)
- Try converting to text format
- Use a tool like Adobe Acrobat OCR

**"File too large":**
- Maximum size is 10MB
- Compress or remove images from resume

### Chat Issues

**"Could not connect to Ollama":**
1. Check Ollama is running: `ollama serve`
2. Verify model is available: `ollama list`
3. Pull the model if needed: `ollama pull llama3.2`

**Slow responses:**
- Use a smaller model (llama3.2 vs llama3.1)
- Ensure sufficient RAM (8GB+ recommended)
- Close other applications

## Tips for Best Results

### Resume Tips

**Before Upload:**
1. Use a clean, standard format
2. Include clear section headers
3. Use bullet points for achievements
4. Remove graphics/charts that don't add value
5. Save as PDF for best results

**Content:**
- Quantify achievements where possible
- Use action verbs (Led, Built, Created, Managed)
- Include relevant skills section
- List specific technologies/tools used

### Job Description Tips

**What to Include:**
- Full job description (not just summary)
- Requirements and qualifications
- Preferred skills section
- Company information
- Role responsibilities

### Getting the Most from Your Report

**Read Strategy:**
1. Start with Executive Summary
2. Review Fit Assessment honestly
3. Note your Strengths - these are your selling points
4. Study the Gaps - prioritize high-impact ones
5. Check Alternative Roles if current target seems unrealistic

**Implementing Recommendations:**
1. Focus on "Quick Wins" first (things you can do this week)
2. Don't try to fix everything at once
3. Use the 30-day action plan as a guide, not a strict schedule
4. Revisit the chat for clarification

### Chat Tips

**Best Questions:**
- Specific: "How should I explain my internship gap?"
- Comparative: "Should I focus on X or Y?"
- Actionable: "What should I do this week?"

**Less Effective:**
- Too vague: "Help me"
- Unrelated to your materials
- Expecting specific job offers

### Iterative Improvement

1. **First Analysis**: Get baseline understanding
2. **Implement Quick Wins**: Fix easy resume issues
3. **Re-analyze**: Upload updated resume
4. **Track Progress**: Compare reports over time
5. **Chat Regularly**: Use for ongoing guidance

## Exporting Your Report

On the Report page, click "Export" to download:
- Markdown format (recommended)
- Includes all sections
- Shareable and printable

## Privacy and Data

**Local Mode (Ollama):**
- Resume and chat data stays on your machine
- No data sent to external AI services (for chat)
- SQLite database is local only

**External API Mode:**
- Report generation sends data to OpenAI/Anthropic
- Review their privacy policies
- Chat can still use local Ollama for privacy

**Data Retention:**
- Data stored in local SQLite database
- Delete `backend/app.db` to remove all data
- No cloud storage or syncing

## Advanced Configuration

### Custom System Prompts

Edit the system prompts in:
- `backend/app/services/report_generator.py` for report generation
- `backend/app/services/chatbot_service.py` for chat responses

### Database Migrations

If you modify models:
```bash
cd backend
alembic init migrations
# Edit alembic.ini to point to your database
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Production Deployment

**Backend:**
```bash
# Use production server
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Or with gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

**Frontend:**
```bash
npm run build
# Serve dist/ folder with nginx, Apache, or similar
```

## Getting Help

1. Check the API docs: http://localhost:8000/docs
2. Review error messages in browser console
3. Check backend logs in terminal
4. Open an issue with:
   - Steps to reproduce
   - Error messages
   - Environment details (OS, Python version, Node version)