// Intake form types
export interface IntakeFormData {
  targetRole: string;
  alternativeRoles: string;
  yearInSchool: string;
  graduationStatus: string;
  major: string;
  industries: string;
  confidenceLevel: string;
  biggestConcern: string;
  perceivedGaps: string;
  strengths: string;
  guidanceTone: 'ambitious' | 'realistic' | 'balanced';
}

// Resume upload types
export interface UploadResponse {
  sessionId: string;
  filename: string;
  fileSize: number;
  parsingStatus: string;
  warnings?: string[];
}

// Analysis types
export interface AnalysisStatusResponse {
  sessionId: string;
  status: 'pending' | 'parsing' | 'analyzing' | 'completed' | 'failed';
  statusMessage?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Report types
export interface Strength {
  strength: string;
  evidence: string;
  positioningTip: string;
}

export interface Weakness {
  weakness: string;
  type: string;
  impact: string;
  mitigation: string;
}

export interface SkillGap {
  skill: string;
  importance: string;
  learnability?: string;
  resources?: string;
  context?: string;
  gap?: string;
  alternativeEvidence?: string;
  missingEvidence?: string;
  howToObtain?: string;
}

export interface SkillGapReport {
  technicalGaps: SkillGap[];
  softSkillGaps: SkillGap[];
  experienceGaps: SkillGap[];
  evidenceGaps: SkillGap[];
}

export interface ResumeImprovement {
  issue: string;
  section: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface RewrittenBullet {
  original: string;
  rewritten: string;
  section: string;
  improvements: string[];
}

export interface InterviewQuestion {
  question: string;
  whyAsked: string;
  prepTip: string;
}

export interface InterviewQuestions {
  behavioral: InterviewQuestion[];
  technical: InterviewQuestion[];
  roleSpecific: InterviewQuestion[];
}

export interface AlternativeRole {
  role: string;
  fitLevel: 'high' | 'medium' | 'low';
  reason: string;
  transitionDifficulty: string;
}

export interface ActionPlanStep {
  week: number;
  priority: string;
  action: string;
  details: string;
  estimatedTime: string;
  outcome?: string;
}

export interface FitAssessment {
  currentAlignment: string;
  competitiveness: string;
  keyBlockers: string[];
  realisticTimeline: string;
}

export interface CareerReport {
  sessionId: string;
  executiveSummary: string;
  fitAssessment: FitAssessment;
  overallMatchScore: number | null;
  strengths: Strength[];
  weaknesses: Weakness[];
  skillGaps: SkillGapReport;
  resumeImprovements: ResumeImprovement[];
  rewrittenBullets: RewrittenBullet[];
  interviewQuestions: InterviewQuestions;
  alternativeRoles: AlternativeRole[];
  actionPlan: ActionPlanStep[];
  confidenceNotes: string[];
  createdAt: string;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
  suggestedFollowups?: string[];
}

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
}