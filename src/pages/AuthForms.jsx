import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2 } from 'lucide-react';

const AuthForms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsLogin(false);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      <div className="absolute top-6 left-6 cursor-pointer text-gray-400 hover:text-white transition-colors text-sm font-medium" onClick={() => navigate('/')}>
        ← Back to Home
      </div>

      {/* Header Area */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="bg-primary p-3 rounded-xl mb-6 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <BrainCircuit className="text-white" size={28} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          Welcome to NovaresumeAI
        </h2>
        <p className="text-gray-400 font-medium">
          Sign in to start your ATS readiness assessment
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-[#0E121E] border border-[#1E2541] rounded-2xl p-8 shadow-2xl relative">
        <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none"></div>
        
        {/* Toggle Controls */}
        <div className="flex bg-[#161B2E] rounded-xl p-1 mb-8">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isLogin 
                ? 'bg-[#8B5CF6] text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2541]'
            }`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isLogin 
                ? 'bg-[#8B5CF6] text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1E2541]'
            }`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#161B2E] border border-[#2A314A] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-gray-600"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-[#161B2E] border border-[#2A314A] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-gray-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button 
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[#161B2E] border border-[#2A314A] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-base rounded-xl py-3.5 mt-2 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(139,92,246,0.39)]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>

      {/* Footer text */}
      <div className="mt-8 text-center text-sm text-gray-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
        >
          {isLogin ? "Register" : "Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForms;
