import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Briefcase, ChevronRight, ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { IntakeFormData } from '../types';

interface StepProps {
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
}

function StepIndicator({ isActive, isComplete, number, title }: StepProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          isComplete
            ? 'bg-green-500 text-white'
            : isActive
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-5 h-5" /> : number}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${
          isActive ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        {title}
      </span>
    </div>
  );
}

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

  const canProceed = useCallback(() => {
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
  }, [currentStep, uploadStatus, jobDescription, intakeData]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Analysis</h1>
          <p className="text-gray-600">Let's analyze your fit for your target role</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <StepIndicator
                  isActive={currentStep === step.number}
                  isComplete={currentStep > step.number}
                  number={step.number}
                  title={step.title}
                />
                {idx < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-px mx-2 sm:mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card"
        >
          {/* Step 1: Upload Resume */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Resume</h2>
                <p className="text-gray-600">We accept PDF, DOCX, or TXT files up to 10MB</p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  uploadStatus === 'success'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                    <span className="text-gray-600">Uploading and parsing...</span>
                  </div>
                ) : uploadStatus === 'success' ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file?.name}</p>
                      <p className="text-sm text-green-600">Successfully uploaded</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Click to upload your resume</p>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Target Job Description</h2>
                <p className="text-gray-600">Paste the job description for the role you're targeting</p>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows={12}
                className="input-field resize-none"
              />

              <p className="text-sm text-gray-500">
                {jobDescription.length} characters (minimum 50 recommended)
              </p>
            </div>
          )}

          {/* Step 3: Intake Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Tell Us About Yourself</h2>
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
                    placeholder="e.g., Software Engineer, Data Analyst"
                    className="input-field"
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
                    placeholder="e.g., Product Manager, UX Designer"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year in School</label>
                  <select
                    value={intakeData.yearInSchool}
                    onChange={(e) => setIntakeData({ ...intakeData, yearInSchool: e.target.value })}
                    className="input-field"
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
                    className="input-field"
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
                    placeholder="e.g., Tech, Finance, Healthcare"
                    className="input-field"
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
                    placeholder="What worries you most about your job search?"
                    rows={3}
                    className="input-field resize-none"
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
                    className="input-field resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strengths to Highlight
                  </label>
                  <textarea
                    value={intakeData.strengths}
                    onChange={(e) => setIntakeData({ ...intakeData, strengths: e.target.value })}
                    placeholder="What are you most proud of? What do you want employers to know?"
                    rows={3}
                    className="input-field resize-none"
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
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Ready to generate your career analysis?</p>
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

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong> We'll analyze your resume against the job description, assess your fit, identify gaps, and create a personalized 30-day action plan. This takes about 30-60 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`btn-primary ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Generate Analysis
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
