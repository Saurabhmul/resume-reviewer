import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle, BrainCircuit, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper animate-fade-in min-h-screen flex flex-col items-center">
      {/* Navigation Layer */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center mb-16">
        <div className="logo cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
          <div className="bg-primary p-2 rounded-lg">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <span className="font-bold text-white text-xl tracking-wide">NovaresumeAI</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <button className="text-gray-300 hover:text-white font-medium transition-colors" onClick={() => navigate('/auth?mode=login')}>Log in</button>
          <button className="btn btn-primary px-6 py-2.5 rounded-full" onClick={() => navigate('/auth?mode=register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-700 bg-[#161B2E] bg-opacity-50 text-gray-300 text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Sparkles size={14} className="text-primary" />
          <span>Powered by Advanced AI Models</span>
        </div>
        
        {/* Massive Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
           Secure Your Dream Job<br/>
           with <span className="text-primary font-bold drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]">AI Confidence</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          The intelligent readiness tool for professionals. We review your resume, 
          assess your ATS compatibility, and prepare you for interviews using advanced AI.
        </p>
        
        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button 
            className="btn btn-primary text-base px-8 py-3.5 flex items-center gap-2"
            onClick={() => navigate('/auth?mode=register')}
          >
            Optimize Your Resume
            <ArrowRight size={18} />
          </button>
          <button 
            className="btn bg-[#1A1F35] text-white border border-[#2A314A] hover:bg-[#202741] px-8 py-3.5 transition-colors"
          >
            How it works
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {/* Feature 1 */}
          <div className="bg-[#121629] border border-[#1E2541] rounded-2xl p-8 text-left transition-all hover:bg-[#151A30]">
            <div className="bg-[#2A2B4D] w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <FileText className="text-[#A78BFA]" size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Smart Resume Review</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our AI scans your resume for common errors, missing metrics, and discrepancies that could lead to instant ATS rejection.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#121629] border border-[#1E2541] rounded-2xl p-8 text-left transition-all hover:bg-[#151A30]">
            <div className="bg-[#1D3249] w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-[#38BDF8]" size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Keyword Assessment</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automated industry keyword checking and density calculations based on the specific job titles you are targeting.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#121629] border border-[#1E2541] rounded-2xl p-8 text-left transition-all hover:bg-[#151A30]">
            <div className="bg-[#12362C] w-12 h-12 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-[#10B981]" size={22} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Interview Readiness</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Practice behavioral questions with real-time AI feedback on your answers to ensure consistency and impact.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
