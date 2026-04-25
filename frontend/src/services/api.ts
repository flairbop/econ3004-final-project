import type { IntakeFormData, UploadResponse, AnalysisStatusResponse, CareerReport, ChatResponse, ChatHistoryResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const REQUEST_TIMEOUT_MS = 30000;

class ApiService {
  private async fetchWithError(endpoint: string, options?: RequestInit): Promise<any> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: options?.signal ?? controller.signal,
        headers: {
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out. The server may be overloaded, please try again.');
      }

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Cannot connect to the server. Please make sure the backend is running on ' +
          API_BASE_URL
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Network error: request failed');
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  }

  // Upload resume
  async uploadResume(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Failed to upload resume');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          throw new Error(
            'Cannot connect to the server. Please make sure the backend is running on ' +
            API_BASE_URL
          );
        }
        throw error;
      }
      throw new Error('Network error: Unable to upload resume');
    }
  }

  // Start analysis
  async startAnalysis(
    sessionId: string,
    jobDescription: string,
    intake: IntakeFormData
  ): Promise<{ sessionId: string; status: string }> {
    const payload = {
      session_id: sessionId,
      job_description: jobDescription,
      intake: {
        target_role: intake.targetRole,
        alternative_roles: intake.alternativeRoles,
        year_in_school: intake.yearInSchool,
        graduation_status: intake.graduationStatus,
        major: intake.major,
        industries: intake.industries,
        confidence_level: intake.confidenceLevel,
        biggest_concern: intake.biggestConcern,
        perceived_gaps: intake.perceivedGaps,
        strengths: intake.strengths,
        guidance_tone: intake.guidanceTone,
      },
    };

    return this.fetchWithError('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  // Get analysis status
  async getAnalysisStatus(sessionId: string): Promise<AnalysisStatusResponse> {
    return this.fetchWithError(`/status/${sessionId}`);
  }

  // Get report
  async getReport(sessionId: string): Promise<CareerReport> {
    const response = await this.fetchWithError(`/report/${sessionId}`);

    // Helper to safely parse JSON strings that might come from the backend
    const safeParse = (val: any, fallback: any = []) => {
      if (val === null || val === undefined) return fallback;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return fallback; }
      }
      return val;
    };

    // Helper to get a field from either camelCase or snake_case key
    const getField = (camel: string, snake: string, fallback: any = []) => {
      const val = response[camel] !== undefined ? response[camel] : response[snake];
      return safeParse(val, fallback);
    };

    // Map backend response to frontend CareerReport type
    // Backend sends camelCase via pydantic alias_generator=to_camel
    return {
      sessionId: response.sessionId || response.session_id || sessionId,
      executiveSummary: response.executiveSummary || response.executive_summary || '',
      fitAssessment: getField('fitAssessment', 'fit_assessment', {
        currentAlignment: 'Unknown',
        competitiveness: 'Unknown',
        keyBlockers: [],
        realisticTimeline: 'Unknown'
      }),
      overallMatchScore: response.overallMatchScore ?? response.overall_match_score ?? null,
      strengths: getField('strengths', 'strengths', []),
      weaknesses: getField('weaknesses', 'weaknesses', []),
      skillGaps: getField('skillGaps', 'skill_gaps', {
        technicalGaps: [], softSkillGaps: [], experienceGaps: [], evidenceGaps: []
      }),
      resumeImprovements: getField('resumeImprovements', 'resume_improvements', []),
      rewrittenBullets: getField('rewrittenBullets', 'rewritten_bullets', []),
      interviewQuestions: getField('interviewQuestions', 'interview_questions', {
        behavioral: [], technical: [], roleSpecific: []
      }),
      alternativeRoles: getField('alternativeRoles', 'alternative_roles', []),
      actionPlan: getField('actionPlan', 'action_plan', []),
      confidenceNotes: getField('confidenceNotes', 'confidence_notes', []),
      createdAt: response.createdAt || response.created_at || new Date().toISOString(),
    };
  }

  // Send chat message
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    return this.fetchWithError(`/chat/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  }

  // Get chat history
  async getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    return this.fetchWithError(`/chat/${sessionId}/history`);
  }

  // Get suggested followups
  async getSuggestedFollowups(sessionId: string): Promise<{ suggestions: string[] }> {
    return this.fetchWithError(`/chat/${sessionId}/suggestions`);
  }
}

export const api = new ApiService();
