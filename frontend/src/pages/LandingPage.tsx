import { motion } from 'framer-motion';
import { ArrowRight, Target, ClipboardCheck, MessageSquare, Sparkles, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Strategic Role Matching',
      description: "Understand exactly what jobs you're competitive for and how well your background aligns with target roles."
    },
    {
      icon: ClipboardCheck,
      title: 'Resume Intelligence',
      description: 'Get specific, actionable improvements to your resume bullets with honest rewrite suggestions.'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Coaching',
      description: 'Chat with your AI career coach to explore alternatives, refine your strategy, and get personalized advice.'
    },
    {
      icon: TrendingUp,
      title: '30-Day Roadmap',
      description: 'Receive a practical, prioritized action plan with concrete steps to improve your competitiveness.'
    }
  ];

  const whatYouGet = [
    'Executive summary of your current position',
    'Detailed fit assessment with key blockers',
    'Identified strengths with positioning tips',
    'Honest gap analysis with mitigation strategies',
    'Skill gap breakdown (technical, soft skills, experience)',
    'Resume bullet rewrites with explanations',
    'Likely interview questions with prep guidance',
    'Alternative career path suggestions',
    'Prioritized 30-day action plan',
    'Confidence notes and caveats'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">AI Career Coach</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary text-sm px-4 py-2"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Powered by AI, grounded in strategy
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Your personal{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                career strategist
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Not a resume grader. Not a keyword scanner. A genuine career coach that helps you understand what you&apos;re competitive for, what&apos;s missing, and exactly what to do next.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary text-lg px-8 py-4 group"
              >
                Start Your Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <span className="text-gray-500 text-sm">Free • Takes 5 minutes</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>For students & early-career professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Honest, strategic guidance</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Four simple steps to strategic career clarity</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'PDF, DOCX, or TXT' },
              { step: '02', title: 'Paste Job Description', desc: 'Or describe your target role' },
              { step: '03', title: 'Answer Questions', desc: 'Quick intake about your goals' },
              { step: '04', title: 'Get Your Report', desc: 'Then chat with your coach' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="card text-center">
                  <span className="text-4xl font-bold text-blue-200">{item.step}</span>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We don&apos;t just scan for keywords. We provide genuine strategic career guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Your Comprehensive Career Report
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Get a detailed analysis that goes far beyond a simple match score. Understand your position, your gaps, and your path forward.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary"
              >
                Get Your Report
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {whatYouGet.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elevated bg-gradient-to-br from-blue-600 to-blue-700 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready for career clarity?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Stop guessing. Get honest, strategic guidance about your job search and a clear roadmap for the next 30 days.
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Start Free Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">AI Career Coach</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built for students and early-career professionals
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
