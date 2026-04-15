import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">AI Career Coach</span>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try It Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Career Coach
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A career analysis tool that helps you understand your fit for target roles
            and provides actionable feedback on your resume.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Resume Analysis</h3>
            <p className="text-gray-600 text-sm">
              Upload your resume and get feedback on how well it matches your target role.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Gap Identification</h3>
            <p className="text-gray-600 text-sm">
              Understand what skills or experiences you're missing for your desired position.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Action Plan</h3>
            <p className="text-gray-600 text-sm">
              Receive a prioritized list of steps to improve your competitiveness.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <ol className="space-y-3 text-gray-600">
            <li><span className="font-medium text-gray-900">1.</span> Upload your resume (PDF, DOCX, or TXT)</li>
            <li><span className="font-medium text-gray-900">2.</span> Paste a job description or describe your target role</li>
            <li><span className="font-medium text-gray-900">3.</span> Answer a few questions about your background</li>
            <li><span className="font-medium text-gray-900">4.</span> Get a detailed analysis and action plan</li>
          </ol>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/analyze')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Analysis
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            ECON 3004 Class Project &middot; Built for educational purposes
          </p>
        </div>
      </footer>
    </div>
  );
}
