import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BrainCircuit } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import AnalysisLoader from '../components/AnalysisLoader';
import FeedbackReport from '../components/FeedbackReport';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // App states: 'idle' | 'analyzing' | 'results'
  const [appState, setAppState] = useState('idle');
  const [fileName, setFileName] = useState('');
  const [fileObject, setFileObject] = useState(null);

  const handleFileUpload = (file) => {
    setFileName(file.name);
    setFileObject(file);
    setAppState('analyzing');
  };

  const handleAnalysisComplete = () => {
    setAppState('results');
  };

  const resetFlow = () => {
    setAppState('idle');
    setFileName('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D17] text-white font-inter">
      {/* Top Navbar */}
      <nav className="w-full border-b border-[#1E2541] bg-[#0E121E]/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetFlow}>
            <div className="bg-primary p-1.5 rounded-lg">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <span className="font-bold text-white text-lg tracking-wide hidden sm:block">NovaresumeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium bg-[#161B2E] px-4 py-2 rounded-full border border-[#2A314A]">
              <User size={16} className="text-[#8B5CF6]" />
              <span>{user?.name || 'User'}</span>
            </div>
            <button 
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center animate-fade-in">
        
        {appState === 'idle' && (
          <div className="w-full max-w-2xl text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">Let's Review Your Resume</h1>
            <p className="text-gray-400 text-lg">Upload your latest resume (PDF or TXT) and our AI will provide instant feedback on how to improve its impact.</p>
          </div>
        )}

        <div className={`w-full ${appState === 'results' ? 'max-w-5xl' : 'max-w-2xl'} transition-all duration-500`}>
          {appState === 'idle' && (
            <FileUpload onFileUpload={handleFileUpload} />
          )}

          {appState === 'analyzing' && (
            <div className="bg-[#0E121E] border border-[#1E2541] shadow-2xl rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-sm text-[#C4B5FD] font-medium bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-4 py-1.5 rounded-full mb-8 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                 <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                 Processing: {fileName}
              </div>
              <AnalysisLoader onComplete={handleAnalysisComplete} />
            </div>
          )}

          {appState === 'results' && (
             <div className="animate-fade-in">
               <FeedbackReport onReset={resetFlow} fileObject={fileObject} />
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
