import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import type { IntakeFormData } from '../types';

export function AnalyzePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResponse, setUploadResponse] = useState<{ sessionId: string } | null>(null);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [intakeData, setIntakeData] = useState<IntakeFormData>({
    targetRole: '',
    alternativeRoles: '',
    yearInSchool: '',
    graduationStatus: '',
    major: '',
    industries: '',
    confidenceLevel: '',
    biggestConcern: '',
    perceivedGaps: '',
    strengths: '',
    guidanceTone: 'balanced',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus('uploading');
    setError(null);
    setUploadWarnings([]);

    try {
      const response = await api.uploadResume(selectedFile);
      setUploadStatus('success');
      setUploadResponse({ sessionId: response.sessionId });
      if (response.warnings) {
        setUploadWarnings(response.warnings);
      }
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    }
  };

  const handleSubmit = async () => {
    if (!uploadResponse?.sessionId || !jobDescription.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.startAnalysis(uploadResponse.sessionId, jobDescription, intakeData);
      navigate(`/report/${uploadResponse.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Resume', number: 1 },
    { title: 'Job Description', number: 2 },
    { title: 'About You', number: 3 },
    { title: 'Review', number: 4 },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadStatus === 'success';
      case 2:
        return jobDescription.trim().length >= 50;
      case 3:
        return intakeData.targetRole.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Career Analysis</h1>
          <p className="text-gray-600">Complete the steps below to generate your analysis</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          {/* Step 1: Upload Resume */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h2>
                <p className="text-gray-600">PDF, DOCX, or TXT files up to 10MB</p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${
                  uploadStatus === 'success'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadStatus === 'uploading' ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-gray-600">Uploading...</span>
                  </div>
                ) : uploadStatus === 'success' ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file?.name}</p>
                      <p className="text-sm text-green-600">Uploaded successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Click to upload</p>
                      <p className="text-sm text-gray-500">PDF, DOCX, or TXT</p>
                    </div>
                  </div>
                )}
              </div>

              {uploadWarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Parsing Notes:</p>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {uploadWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job Description */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Target Job Description</h2>
                <p className="text-gray-600">Paste the job description for your target role</p>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
              />

              <p className="text-sm text-gray-500">
                {jobDescription.length} characters (minimum 50)
              </p>
            </div>
          )}

          {/* Step 3: Intake Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About You</h2>
                <p className="text-gray-600">Help us personalize your analysis</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role *
                  </label>
                  <input
                    type="text"
                    value={intakeData.targetRole}
                    onChange={(e) => setIntakeData({ ...intakeData, targetRole: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternative Roles (Optional)
                  </label>
                  <input
                    type="text"
                    value={intakeData.alternativeRoles}
                    onChange={(e) => setIntakeData({ ...intakeData, alternativeRoles: e.target.value })}
                    placeholder="e.g., Product Manager"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year in School</label>
                  <select
                    value={intakeData.yearInSchool}
                    onChange={(e) => setIntakeData({ ...intakeData, yearInSchool: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select...</option>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate Student</option>
                    <option value="recent_grad">Recent Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field</label>
                  <input
                    type="text"
                    value={intakeData.major}
                    onChange={(e) => setIntakeData({ ...intakeData, major: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industries of Interest
                  </label>
                  <input
                    type="text"
                    value={intakeData.industries}
                    onChange={(e) => setIntakeData({ ...intakeData, industries: e.target.value })}
                    placeholder="e.g., Tech, Finance"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intakeData.confidenceLevel || 5}
                    onChange={(e) => setIntakeData({ ...intakeData, confidenceLevel: e.target.value })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biggest Concern
                  </label>
                  <textarea
                    value={intakeData.biggestConcern}
                    onChange={(e) => setIntakeData({ ...intakeData, biggestConcern: e.target.value })}
                    placeholder="What worries you most?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perceived Gaps
                  </label>
                  <textarea
                    value={intakeData.perceivedGaps}
                    onChange={(e) => setIntakeData({ ...intakeData, perceivedGaps: e.target.value })}
                    placeholder="What do you feel you're missing?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strengths
                  </label>
                  <textarea
                    value={intakeData.strengths}
                    onChange={(e) => setIntakeData({ ...intakeData, strengths: e.target.value })}
                    placeholder="What are you most proud of?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guidance Tone
                  </label>
                  <div className="flex gap-4">
                    {(['ambitious', 'balanced', 'realistic'] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setIntakeData({ ...intakeData, guidanceTone: tone })}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                          intakeData.guidanceTone === tone
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="capitalize">{tone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Ready to generate your analysis?</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Resume</span>
                  </div>
                  <p className="text-gray-600 ml-8">{file?.name}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Target Role</span>
                  </div>
                  <p className="text-gray-600 ml-8">{intakeData.targetRole}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-5 h-5 flex items-center justify-center text-blue-600 font-bold">JD</span>
                    <span className="font-medium text-gray-900">Job Description</span>
                  </div>
                  <p className="text-gray-600 ml-8">{jobDescription.slice(0, 100)}...</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg border border-gray-200 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2 inline" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-4 py-2 rounded-lg bg-blue-600 text-white ${!canProceed() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2 inline" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Analysis'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
