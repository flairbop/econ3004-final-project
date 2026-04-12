import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, AlertTriangle, CheckCircle, FileEdit,
  MessageSquare, TrendingUp, Briefcase, AlertCircle,
  Loader2, ChevronLeft, MessageCircle, Download, Sparkles,
  ArrowRight, Clock, Zap, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import type {
  CareerReport, Strength, Weakness,
  ResumeImprovement, RewrittenBullet, InterviewQuestion,
  AlternativeRole, ActionPlanStep
} from '../types';

export function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CareerReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (!sessionId) return;

    const loadReport = async () => {
      try {
        setIsLoading(true);
        let status = await api.getAnalysisStatus(sessionId);

        if (status.status === 'pending' || status.status === 'analyzing') {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          status = await api.getAnalysisStatus(sessionId);
        }

        if (status.status === 'completed') {
          const reportData = await api.getReport(sessionId);
          setReport(reportData);
        } else if (status.status === 'failed') {
          setError(status.errorMessage || 'Analysis failed');
        } else {
          setTimeout(() => loadReport(), 3000);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [sessionId]);

  const handleExport = () => {
    if (!report) return;
    const reportText = generateReportMarkdown(report);
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-report-${sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Generating Your Report</h2>
          <p className="text-gray-500 max-w-sm mx-auto">Analyzing your resume against the target role. This typically takes 30–60 seconds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/analyze')} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Target },
    { id: 'strengths', label: 'Strengths', icon: CheckCircle },
    { id: 'gaps', label: 'Gaps', icon: AlertTriangle },
    { id: 'resume', label: 'Resume Tips', icon: FileEdit },
    { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
    { id: 'alternatives', label: 'Alternatives', icon: Briefcase },
    { id: 'roadmap', label: '30-Day Plan', icon: TrendingUp },
  ];

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  const scoreBg = (score: number | null) => {
    if (!score) return 'bg-gray-50';
    if (score >= 70) return 'bg-emerald-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="btn-secondary text-sm px-4 py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => navigate(`/chat/${sessionId}`)}
                className="btn-primary text-sm px-4 py-2"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Coach
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Career Analysis Report</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Career Analysis</h1>
              <p className="text-gray-500 text-sm">
                Generated on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {report.overallMatchScore !== null && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Match Score</p>
                  <p className={`text-4xl font-extrabold ${scoreColor(report.overallMatchScore)}`}>
                    {report.overallMatchScore}
                    <span className="text-lg font-medium text-gray-300">%</span>
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${scoreBg(report.overallMatchScore)}`}>
                  <Target className={`w-7 h-7 ${scoreColor(report.overallMatchScore)}`} />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* ============ SUMMARY TAB ============ */}
          {activeTab === 'summary' && (
            <>
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Executive Summary</h2>
                <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {report.executiveSummary}
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Fit Assessment</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Current Alignment</p>
                    <p className="text-gray-700">{report.fitAssessment?.currentAlignment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Competitiveness</p>
                    <span className={`badge ${
                      report.fitAssessment?.competitiveness?.toLowerCase().includes('under')
                        ? 'badge-red'
                        : report.fitAssessment?.competitiveness?.toLowerCase().includes('decent')
                        ? 'badge-yellow'
                        : 'badge-green'
                    }`}>
                      {report.fitAssessment?.competitiveness}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Key Blockers</p>
                    <ul className="space-y-2">
                      {report.fitAssessment?.keyBlockers?.map((blocker: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Realistic Timeline</p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {report.fitAssessment?.realisticTimeline}
                    </div>
                  </div>
                </div>
              </div>

              {report.confidenceNotes?.length > 0 && (
                <div className="card bg-amber-50/50 border-amber-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Confidence Notes</h3>
                      <ul className="space-y-1.5">
                        {report.confidenceNotes.map((note: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600">{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============ STRENGTHS TAB ============ */}
          {activeTab === 'strengths' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Your Strengths</h2>
                <p className="text-sm text-gray-500 mt-1">Key competencies identified from your resume and profile</p>
              </div>
              {report.strengths?.length > 0 ? (
                <div className="grid gap-4">
                  {report.strengths.map((s: Strength, idx: number) => (
                    <div key={idx} className="card severity-low">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{s.strength}</h3>
                          <p className="text-sm text-gray-600 mb-3">{s.evidence}</p>
                          {(s.positioningTip || (s as any).positioning_tip) && (
                            <div className="flex items-start gap-2 bg-blue-50/50 rounded-lg p-3">
                              <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-700">{s.positioningTip || (s as any).positioning_tip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12 text-gray-400">No strengths data available</div>
              )}
            </>
          )}

          {/* ============ GAPS TAB ============ */}
          {activeTab === 'gaps' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Gap Analysis</h2>
                <p className="text-sm text-gray-500 mt-1">Honest assessment of areas to improve</p>
              </div>

              {/* Weaknesses */}
              {report.weaknesses?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Identified Weaknesses</h3>
                  {report.weaknesses.map((w: Weakness, idx: number) => (
                    <div key={idx} className={`card ${
                      w.impact?.toLowerCase() === 'high' ? 'severity-high' :
                      w.impact?.toLowerCase() === 'medium' ? 'severity-medium' : 'severity-low'
                    }`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-semibold text-gray-900">{w.weakness}</h4>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`badge ${
                            w.type === 'skill_gap' ? 'badge-red' :
                            w.type === 'evidence_gap' ? 'badge-yellow' :
                            w.type === 'positioning_gap' ? 'badge-blue' : 'badge-purple'
                          }`}>
                            {w.type?.replace('_', ' ')}
                          </span>
                          <span className={`badge ${
                            w.impact?.toLowerCase() === 'high' ? 'badge-red' :
                            w.impact?.toLowerCase() === 'medium' ? 'badge-yellow' : 'badge-green'
                          }`}>
                            {w.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{w.mitigation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skill Gaps Breakdown */}
              {report.skillGaps && (
                <div className="space-y-6 mt-8">
                  {report.skillGaps.technicalGaps?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Technical Gaps</h3>
                      <div className="grid gap-3">
                        {report.skillGaps.technicalGaps.map((g, idx) => (
                          <div key={idx} className="card py-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{g.skill}</span>
                              <span className={`badge ${
                                g.importance === 'Critical' ? 'badge-red' :
                                g.importance === 'Recommended' ? 'badge-yellow' : 'badge-gray'
                              }`}>{g.importance}</span>
                            </div>
                            {g.learnability && <p className="text-sm text-gray-500">Learnability: {g.learnability}</p>}
                            {g.resources && <p className="text-sm text-blue-600 mt-1">→ {g.resources}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.skillGaps.evidenceGaps?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Evidence Gaps</h3>
                      <div className="grid gap-3">
                        {report.skillGaps.evidenceGaps.map((g, idx) => (
                          <div key={idx} className="card py-4">
                            <p className="font-medium text-gray-900 mb-1">{g.missingEvidence || g.skill || g.gap}</p>
                            {g.howToObtain && <p className="text-sm text-gray-500">How to fix: {g.howToObtain}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ============ RESUME TIPS TAB ============ */}
          {activeTab === 'resume' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Resume Improvements</h2>
                <p className="text-sm text-gray-500 mt-1">Specific suggestions to strengthen your resume</p>
              </div>

              {/* Improvement Suggestions */}
              {report.resumeImprovements?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Issues to Fix</h3>
                  {report.resumeImprovements.map((imp: ResumeImprovement, idx: number) => (
                    <div key={idx} className={`card py-4 ${
                      imp.severity === 'high' ? 'severity-high' :
                      imp.severity === 'medium' ? 'severity-medium' : 'severity-low'
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{imp.issue}</h4>
                        <div className="flex gap-2 flex-shrink-0">
                          {imp.section && <span className="badge badge-gray">{imp.section}</span>}
                          <span className={`badge ${
                            imp.severity === 'high' ? 'badge-red' :
                            imp.severity === 'medium' ? 'badge-yellow' : 'badge-green'
                          }`}>{imp.severity}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{imp.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bullet Rewrites */}
              {report.rewrittenBullets?.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bullet Rewrites</h3>
                  {report.rewrittenBullets.map((b: RewrittenBullet, idx: number) => (
                    <div key={idx} className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <FileEdit className="w-4 h-4 text-blue-500" />
                        <span className="badge badge-blue">{b.section}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-red-50/50 rounded-lg p-3">
                          <p className="text-xs text-red-400 font-medium mb-1">ORIGINAL</p>
                          <p className="text-sm text-gray-700 line-through decoration-red-300">{b.original}</p>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRight className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="bg-emerald-50/50 rounded-lg p-3">
                          <p className="text-xs text-emerald-500 font-medium mb-1">IMPROVED</p>
                          <p className="text-sm text-gray-900 font-medium">{b.rewritten}</p>
                        </div>
                      </div>
                      {b.improvements?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {b.improvements.map((imp: string, i: number) => (
                            <span key={i} className="badge badge-blue">{imp}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(!report.resumeImprovements?.length && !report.rewrittenBullets?.length) && (
                <div className="card text-center py-12 text-gray-400">No resume improvement data available</div>
              )}
            </>
          )}

          {/* ============ INTERVIEW PREP TAB ============ */}
          {activeTab === 'interview' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Interview Preparation</h2>
                <p className="text-sm text-gray-500 mt-1">Likely questions based on your profile and gaps</p>
              </div>

              {report.interviewQuestions && (
                <div className="space-y-8">
                  {[
                    { key: 'behavioral' as const, label: 'Behavioral Questions', color: 'badge-purple' },
                    { key: 'technical' as const, label: 'Technical Questions', color: 'badge-blue' },
                    { key: 'roleSpecific' as const, label: 'Role-Specific Questions', color: 'badge-green' },
                  ].map(({ key, label }) => {
                    const questions = report.interviewQuestions?.[key] || (report.interviewQuestions as any)?.[key.replace(/[A-Z]/g, m => '_' + m.toLowerCase())] || [];
                    if (questions.length === 0) return null;
                    return (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</h3>
                        <div className="space-y-3">
                          {questions.map((q: InterviewQuestion | any, idx: number) => (
                            <div key={idx} className="card py-4">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                                  <p className="text-sm text-gray-500 mb-2">
                                    <span className="font-medium">Why asked:</span> {q.whyAsked || q.why_asked}
                                  </p>
                                  <div className="flex items-start gap-2 bg-blue-50/50 rounded-lg p-2.5">
                                    <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-700">{q.prepTip || q.prep_tip}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!report.interviewQuestions && (
                <div className="card text-center py-12 text-gray-400">No interview preparation data available</div>
              )}
            </>
          )}

          {/* ============ ALTERNATIVES TAB ============ */}
          {activeTab === 'alternatives' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">Alternative Career Paths</h2>
                <p className="text-sm text-gray-500 mt-1">Other roles that may be a strong fit for your profile</p>
              </div>

              {report.alternativeRoles?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {report.alternativeRoles.map((role: AlternativeRole, idx: number) => (
                    <div key={idx} className="card">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{role.role}</h3>
                        <span className={`badge ${
                          (role.fitLevel as string).toLowerCase() === 'high' ? 'badge-green' :
                          (role.fitLevel as string).toLowerCase() === 'medium' ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {role.fitLevel} fit
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{role.reason}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Transition: {role.transitionDifficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12 text-gray-400">No alternative roles data available</div>
              )}
            </>
          )}

          {/* ============ 30-DAY PLAN TAB ============ */}
          {activeTab === 'roadmap' && (
            <>
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900">30-Day Action Plan</h2>
                <p className="text-sm text-gray-500 mt-1">Your prioritized roadmap to becoming more competitive</p>
              </div>

              {report.actionPlan?.length > 0 ? (
                <div className="space-y-4">
                  {report.actionPlan.map((step: ActionPlanStep, idx: number) => (
                    <div key={idx} className="card">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            step.priority === 'Must do' ? 'bg-red-50 text-red-600' :
                            step.priority === 'Should do' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            W{step.week}
                          </div>
                          {idx < report.actionPlan.length - 1 && (
                            <div className="w-px h-8 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{step.action}</h4>
                            <span className={`badge ${
                              step.priority === 'Must do' ? 'badge-red' :
                              step.priority === 'Should do' ? 'badge-yellow' : 'badge-blue'
                            }`}>{step.priority}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {step.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{step.estimatedTime}</span>
                              </div>
                            )}
                            {step.outcome && (
                              <div className="flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" />
                                <span>{step.outcome}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12 text-gray-400">No action plan data available</div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function generateReportMarkdown(report: CareerReport): string {
  let md = `# Career Analysis Report

## Executive Summary
${report.executiveSummary}

## Fit Assessment
- **Current Alignment**: ${report.fitAssessment?.currentAlignment}
- **Competitiveness**: ${report.fitAssessment?.competitiveness}
- **Realistic Timeline**: ${report.fitAssessment?.realisticTimeline}

## Key Blockers
${report.fitAssessment?.keyBlockers?.map(b => `- ${b}`).join('\n')}

## Strengths
${report.strengths?.map(s => `### ${s.strength}\n- Evidence: ${s.evidence}\n- Tip: ${s.positioningTip || (s as any).positioning_tip || 'N/A'}`).join('\n\n')}

## Weaknesses
${report.weaknesses?.map(w => `### ${w.weakness}\n- Type: ${w.type}\n- Impact: ${w.impact}\n- Mitigation: ${w.mitigation}`).join('\n\n')}
`;

  if (report.resumeImprovements?.length) {
    md += `\n## Resume Improvements\n${report.resumeImprovements.map(i => `- **${i.issue}** (${i.severity}): ${i.suggestion}`).join('\n')}\n`;
  }

  if (report.rewrittenBullets?.length) {
    md += `\n## Bullet Rewrites\n${report.rewrittenBullets.map(b => `- Original: ${b.original}\n  Improved: ${b.rewritten}`).join('\n\n')}\n`;
  }

  if (report.actionPlan?.length) {
    md += `\n## Action Plan\n${report.actionPlan.map(step => `### Week ${step.week}: ${step.action}\n- Priority: ${step.priority}\n- Details: ${step.details}\n- Estimated Time: ${step.estimatedTime || 'N/A'}`).join('\n\n')}\n`;
  }

  md += `\n---\n*Generated on ${new Date(report.createdAt).toLocaleString()}*\n`;
  return md;
}
