import { motion } from 'framer-motion';
import { ArrowRight, Target, ClipboardCheck, MessageSquare, Sparkles, Users, Briefcase, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Strategic Role Matching',
      description: 'Understand exactly what jobs you\'re competitive for and where you stand against the requirements.'
    },
    {
      icon: ClipboardCheck,
      title: 'Resume Intelligence',
      description: 'Get specific, actionable improvements with honest bullet rewrites that preserve truthfulness.'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Coaching',
      description: 'Chat with your AI career coach to explore alternatives, refine strategy, and get personalized advice.'
    },
    {
      icon: TrendingUp,
      title: '30-Day Roadmap',
      description: 'Receive a practical, prioritized action plan with concrete steps to improve competitiveness.'
    }
  ];

  const whatYouGet = [
    'Executive summary of your current position',
    'Detailed fit assessment with key blockers',
    'Identified strengths with positioning tips',
    'Honest gap analysis with mitigation strategies',
    'Skill gap breakdown: technical, soft skills, experience',
    'Resume bullet rewrites with explanations',
    'Likely interview questions with prep guidance',
    'Alternative career path suggestions',
    'Prioritized 30-day action plan',
    'Confidence notes and caveats'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">AI Career Coach</span>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary text-sm px-5 py-2.5"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-36 overflow-hidden gradient-hero">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100/50">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by AI, grounded in strategy
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] mb-8 tracking-tight"
            >
              Your personal{' '}
              <span className="gradient-text">
                career strategist
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Not a resume grader. Not a keyword scanner. A genuine career coach that helps you understand what you're competitive for, what's missing, and exactly what to do next.
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
              <span className="text-gray-400 text-sm">Free &middot; Takes 5 minutes</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-20 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm"
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
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-lg text-gray-500">Four simple steps to strategic career clarity</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="card text-center py-8">
                  <span className="text-5xl font-extrabold text-blue-100">{item.step}</span>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">What Makes Us Different</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              We don't just scan for keywords. We provide genuine strategic career guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Your Comprehensive<br />Career Report
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Get a detailed analysis that goes far beyond a simple match score. Understand your position, your gaps, and your path forward.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="btn-primary"
              >
                Get Your Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-3"
            >
              {whatYouGet.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 py-1"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 sm:p-16 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)'
            }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)'
              }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready for career clarity?</h2>
              <p className="text-lg text-blue-200 mb-10 max-w-xl mx-auto leading-relaxed">
                Stop guessing. Get honest, strategic guidance about your job search and a clear roadmap for the next 30 days.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-500">AI Career Coach</span>
            </div>
            <p className="text-gray-400 text-xs">
              Built for students and early-career professionals
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
