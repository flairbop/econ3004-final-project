import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, AlertTriangle, CheckCircle, Lightbulb, FileEdit,
  MessageSquare, TrendingUp, Briefcase, Clock, AlertCircle,
  Loader2, ChevronLeft, MessageCircle, Download
} from 'lucide-react';
import { api } from '../services/api';
import { CareerReport, FitAssessment } from '../types';

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

        // Poll status first
        let status = await api.getAnalysisStatus(sessionId);

        if (status.status === 'pending' || status.status === 'analyzing') {
          // Wait and poll again
          await new Promise((resolve) => setTimeout(resolve, 3000));
          status = await api.getAnalysisStatus(sessionId);
        }

        if (status.status === 'completed') {
          const reportData = await api.getReport(sessionId);
          setReport(reportData);
        } else if (status.status === 'failed') {
          setError(status.errorMessage || 'Analysis failed');
        } else {
          // Still processing, show loading
          setTimeout(() => loadReport(), 3000);
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
    a.download = `career-report-${report.sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Report</h2>
          <p className="text-gray-600">This takes about 30-60 seconds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={() => navigate(`/chat/${sessionId}`)}
                className="btn-primary"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Career Analysis</h1>
              <p className="text-gray-600">
                Generated on {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>

            {report.overallMatchScore !== null && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Match Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {report.overallMatchScore}%
                  </p>
                </div>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  report.overallMatchScore >= 70 ? 'bg-green-100' :
                  report.overallMatchScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Target className={`w-8 h-8 ${
                    report.overallMatchScore >= 70 ? 'text-green-600' :
                    report.overallMatchScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <>
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {report.executiveSummary}
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Fit Assessment</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Alignment</p>
                    <p className="text-gray-900">{report.fitAssessment?.currentAlignment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Competitiveness</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      report.fitAssessment?.competitiveness?.toLowerCase().includes('underqualified')
                        ? 'bg-red-100 text-red-700'
                        : report.fitAssessment?.competitiveness?.toLowerCase().includes('decent')
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {report.fitAssessment?.competitiveness}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Key Blockers</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {report.fitAssessment?.keyBlockers?.map((blocker, idx) => (
                        <li key={idx}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Realistic Timeline</p>
                    <p className="text-gray-900">{report.fitAssessment?.realisticTimeline}</p>
                  </div>
                </div>
              </div>

              {report.confidenceNotes?.length > 0 && (
                <div className="card bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Confidence Notes</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {report.confidenceNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Other tabs would go here - keeping it shorter for brevity */}

          {/* Placeholder for other tabs */}
          {activeTab !== 'summary' && (
            <div className="card">
              <p className="text-gray-600">
                This section displays {activeTab} data. In the full implementation,
                this would show the detailed {tabs.find(t => t.id === activeTab)?.label} information
                from the report.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function generateReportMarkdown(report: CareerReport): string {
  return `# Career Analysis Report

## Executive Summary
${report.executiveSummary}

## Fit Assessment
- **Current Alignment**: ${report.fitAssessment?.currentAlignment}
- **Competitiveness**: ${report.fitAssessment?.competitiveness}
- **Realistic Timeline**: ${report.fitAssessment?.realisticTimeline}

## Key Blockers
${report.fitAssessment?.keyBlockers?.map(b => `- ${b}`).join('\n')}

## Action Plan
${report.actionPlan?.map(step => `
### Week ${step.week}: ${step.action}
- Priority: ${step.priority}
- Details: ${step.details}
- Estimated Time: ${step.estimatedTime}
`).join('\n')}

---
*Generated on ${new Date(report.createdAt).toLocaleString()}*
`;
}
