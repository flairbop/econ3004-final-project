import { IntakeFormData, UploadResponse, AnalysisStatusResponse, CareerReport, ChatResponse, ChatHistoryResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async fetchWithError(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
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

    const response = await fetch(`${API_BASE_URL}/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload resume');
    }

    return response.json();
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

    // Parse JSON fields that are stored as strings
    return {
      ...response,
      fitAssessment: typeof response.fit_assessment === 'string'
        ? JSON.parse(response.fit_assessment)
        : response.fit_assessment,
      strengths: typeof response.strengths === 'string'
        ? JSON.parse(response.strengths)
        : response.strengths,
      weaknesses: typeof response.weaknesses === 'string'
        ? JSON.parse(response.weaknesses)
        : response.weaknesses,
      skillGaps: typeof response.skill_gaps === 'string'
        ? JSON.parse(response.skill_gaps)
        : response.skill_gaps,
      resumeImprovements: typeof response.resume_improvements === 'string'
        ? JSON.parse(response.resume_improvements)
        : response.resume_improvements,
      rewrittenBullets: typeof response.rewritten_bullets === 'string'
        ? JSON.parse(response.rewritten_bullets)
        : response.rewritten_bullets,
      interviewQuestions: typeof response.interview_questions === 'string'
        ? JSON.parse(response.interview_questions)
        : response.interview_questions,
      alternativeRoles: typeof response.alternative_roles === 'string'
        ? JSON.parse(response.alternative_roles)
        : response.alternative_roles,
      actionPlan: typeof response.action_plan === 'string'
        ? JSON.parse(response.action_plan)
        : response.action_plan,
      confidenceNotes: typeof response.confidence_notes === 'string'
        ? JSON.parse(response.confidence_notes)
        : response.confidence_notes,
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