# AI Career Coach - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                            │
│                    (React + TypeScript)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ LandingPage │  │ AnalyzePage  │  │  ReportPage     │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
│         │                │                    │             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ useAnalysis │  │   useChat    │  │   api client    │    │
│  │    hook     │  │    hook      │  │   (fetch/axios) │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                             │
│                      (FastAPI + Python)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Layer                          │   │
│  │  ┌────────────┐ ┌──────────┐ ┌────────────────────┐  │   │
│  │  │ /api/upload│ │/api/analyze│ │ /api/chat/*      │  │   │
│  │  │   -resume  │ │          │ │                  │  │   │
│  │  └────────────┘ └──────────┘ └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Service Layer                        │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ File Parser │  │ Job Parser   │  │Report Generator│   │
│  │  │ (PDF/DOCX)  │  │ (NLP)        │  │              │ │   │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │     AI Providers (Abstracted Interface)       │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │ │   │
│  │  │  │ OpenAI  │ │Anthropic│ │  Ollama (Local) │  │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────────────┘  │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Data Layer                         │   │
│  │              (SQLite + SQLModel)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │ Sessions │ │ Resumes  │ │ Reports  │ │  Chat  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend

#### Pages
- **LandingPage**: Marketing page with feature overview
- **AnalyzePage**: Multi-step form for resume upload, job description, and intake
- **ReportPage**: Tabbed dashboard displaying all report sections
- **ChatPage**: Interactive chat interface with suggested prompts

#### Hooks
- **useAnalysis**: Manages polling for report generation status
- **useChat**: Manages chat state, message sending, and history loading

### Backend

#### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload-resume` | POST | Upload and parse resume file |
| `/api/analyze` | POST | Start analysis with job description and intake |
| `/api/status/{id}` | GET | Check analysis status |
| `/api/report/{id}` | GET | Get generated report |
| `/api/chat/{id}` | POST | Send chat message |
| `/api/chat/{id}/history` | GET | Get chat history |

#### Services

##### File Parser
- Supports PDF (PyPDF2), DOCX (python-docx), TXT
- Extracts raw text and attempts structured parsing
- Returns warnings for parsing issues

##### Job Parser
- Extracts structured data from job descriptions
- Identifies: title, company, skills, requirements, responsibilities
- Uses pattern matching and heuristics

##### Report Generator
- Builds comprehensive prompt with all context
- Calls AI provider for structured JSON output
- Validates and normalizes response

##### Chatbot Service
- Maintains session context (resume, job, report, chat history)
- Builds grounded prompts for each interaction
- Returns context-aware suggestions

### AI Provider Architecture

```
┌────────────────────────────────────────┐
│         BaseAIProvider (ABC)           │
│  - generate(prompt) -> str             │
│  - generate_stream(prompt) -> AsyncGen │
└────────────────────────────────────────┘
         │           │            │
         ▼           ▼            ▼
┌────────────┐ ┌──────────┐ ┌──────────┐
│ OpenAI     │ │Anthropic │ │ Ollama   │
│ Provider   │ │Provider  │ │Provider  │
└────────────┘ └──────────┘ └──────────┘
```

### Data Model

```
AnalysisSession
├── session_id (UUID)
├── status (pending | analyzing | completed | failed)
├── created_at, updated_at
├── ResumeDocument
│   ├── raw_text
│   └── parsed_structure
├── JobDescription
│   ├── raw_text
│   └── parsed_structure
├── IntakeProfile
│   ├── target_role, major, year_in_school
│   ├── confidence_level, biggest_concern
│   └── guidance_tone
├── CareerReport (JSON fields for each section)
└── ChatMessages[]
```

## Key Design Patterns

### 1. Separation of Concerns
- **Report Generation** vs **Chatbot**: Different models can be used
- Report: Can use expensive external API for quality
- Chat: Defaults to free local Ollama for cost

### 2. Structured Data Flow
```
Raw Input → Parsed Structure → AI Analysis → Structured Report → UI Sections
```

### 3. Session-Based Architecture
- Single ID ties all components together
- Enables sharing and revisiting analysis
- Foundation for future user accounts

### 4. Streaming Support
- Chat interface supports streaming responses
- Infrastructure in place for report streaming

## Security Considerations

1. **File Upload**:
   - Extension whitelist (PDF, DOCX, TXT)
   - Size limit (10MB)
   - No execution of uploaded files

2. **CORS**:
   - Configurable origins
   - Defaults to local development

3. **Data**:
   - SQLite for local development
   - No PII beyond what's in resume
   - Local LLM keeps chat data private

## Performance Considerations

1. **Async Operations**:
   - Report generation runs in background
   - Frontend polls for completion
   - Chat uses async/await

2. **Caching**:
   - Report results cached in database
   - Chat history loaded once per session

3. **Token Management**:
   - Configurable token limits
   - Context trimming for chat history

## Extensibility Points

1. **New AI Providers**: Implement BaseAIProvider interface
2. **New Report Sections**: Add to prompt and schema
3. **New File Types**: Add to FileParser
4. **Export Formats**: Add to report export handler
5. **Authentication**: Add to session model