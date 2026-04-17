import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target, AlertTriangle, CheckCircle, FileEdit,
  MessageSquare, TrendingUp, AlertCircle,
  Loader2, ChevronLeft, MessageCircle, Download,
  Clock, Zap, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import type { CareerReport, AnalysisStatusResponse } from '../types';

export function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CareerReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (!sessionId) return;

    let isCancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const loadReport = async () => {
      setIsLoading(true);
      setError(null);

      let networkRetryCount = 0;

      while (!isCancelled) {
        try {
          const status = await api.getAnalysisStatus(sessionId);
          networkRetryCount = 0;

          // Update status message from backend
          if (status.statusMessage) {
            setStatusMessage(status.statusMessage);
          }

          if (status.status === 'completed') {
            const reportData = await api.getReport(sessionId);
            if (!isCancelled) {
              setReport(reportData);
              setIsLoading(false);
            }
            return;
          }

          if (status.status === 'failed') {
            if (!isCancelled) {
              setError(status.errorMessage || 'Analysis failed');
              setIsLoading(false);
            }
            return;
          }

          await sleep(2000);
        } catch (err) {
          networkRetryCount += 1;

          if (networkRetryCount <= 8) {
            await sleep(2000);
            continue;
          }

          if (!isCancelled) {
            setError(err instanceof Error ? err.message : 'Failed to load report');
            setIsLoading(false);
          }
          return;
        }
      }
    };

    loadReport();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  const handleExport = () => {
    if (!report) return;
    const reportText = generateReportMarkdown(report);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-report-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Report</h2>
          {statusMessage ? (
            <p className="text-blue-600 text-sm font-medium mb-1">{statusMessage}</p>
          ) : (
            <p className="text-gray-500 mb-1">This typically takes 2-4 minutes...</p>
          )}
          <p className="text-gray-400 text-sm">Analyzing resume, job description, and generating personalized recommendations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/analyze')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
    { id: 'interview', label: 'Interview', icon: MessageSquare },
    { id: 'roadmap', label: '30-Day Plan', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Export
              </button>
              <button
                onClick={() => navigate(`/chat/${sessionId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2 inline" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-600 font-medium">Career Analysis Report</span>
              <h1 className="text-xl font-bold text-gray-900 mt-1">Your Results</h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            {report.overallMatchScore !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">Match Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(report.overallMatchScore)}`}>
                  {report.overallMatchScore}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{report.executiveSummary}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Fit Assessment</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Current Alignment</span>
                    <p className="text-gray-700">{report.fitAssessment?.currentAlignment}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase">Competitiveness</span>
                    <p className="text-gray-700">{report.fitAssessment?.competitiveness}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strengths' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Strengths</h2>
              {report.strengths?.map((s, idx) => (
                <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 mb-4">
                  <h4 className="font-medium text-gray-900">{s.strength}</h4>
                  <p className="text-sm text-gray-600 mt-1">{s.evidence}</p>
                  {s.positioningTip && (
                    <div className="flex items-start gap-2 mt-2 bg-blue-50 rounded p-2">
                      <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">{s.positioningTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'gaps' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Weaknesses</h2>
                {report.weaknesses?.map((w, idx) => (
                  <div key={idx} className="border-l-4 border-red-400 pl-4 py-2 mb-4">
                    <h4 className="font-medium text-gray-900">{w.weakness}</h4>
                    <p className="text-sm text-gray-600 mt-1">{w.mitigation}</p>
                  </div>
                ))}
              </div>
              {report.skillGaps?.technicalGaps?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Technical Gaps</h3>
                  <div className="space-y-2">
                    {report.skillGaps.technicalGaps.map((g, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <span className="font-medium text-gray-900">{g.skill}</span>
                        {g.resources && <p className="text-sm text-gray-600 mt-1">{g.resources}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Improvements</h2>
              {report.resumeImprovements?.map((imp, idx) => (
                <div key={idx} className="border-l-4 border-amber-400 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">{imp.issue}</h4>
                  <p className="text-sm text-gray-600 mt-1">{imp.suggestion}</p>
                </div>
              ))}
              {report.rewrittenBullets?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Bullet Rewrites</h3>
                  {report.rewrittenBullets.map((b, idx) => (
                    <div key={idx} className="space-y-2 mb-4">
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-xs text-red-600 font-medium">ORIGINAL</p>
                        <p className="text-sm text-gray-700 line-through">{b.original}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600 font-medium">IMPROVED</p>
                        <p className="text-sm text-gray-900">{b.rewritten}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-6">
              {report.interviewQuestions?.behavioral?.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                  <p className="text-sm text-gray-600">{q.whyAsked}</p>
                  {q.prepTip && (
                    <div className="flex items-start gap-2 mt-2 text-blue-700">
                      <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{q.prepTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">30-Day Action Plan</h2>
              {report.actionPlan?.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      W{step.week}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{step.action}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        step.priority === 'Must do' ? 'bg-red-100 text-red-700' :
                        step.priority === 'Should do' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {step.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{step.details}</p>
                    {step.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{step.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number | null) {
  if (!score) return 'text-gray-400';
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-500';
}

function generateReportMarkdown(report: CareerReport): string {
  let md = `Career Analysis Report\n\n`;
  md += `Executive Summary:\n${report.executiveSummary}\n\n`;
  md += `Match Score: ${report.overallMatchScore}%\n\n`;
  md += `---\nGenerated: ${new Date(report.createdAt).toLocaleString()}\n`;
  return md;
}
