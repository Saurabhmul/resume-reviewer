import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Search, BrainCircuit, BarChart } from 'lucide-react';

const steps = [
  { id: 1, label: 'Decoding Document Structure...', icon: Search },
  { id: 2, label: 'Extracting Keywords & Metrics...', icon: BrainCircuit },
  { id: 3, label: 'Evaluating ATS Compatibility...', icon: BarChart },
  { id: 4, label: 'Synthesizing AI Feedback...', icon: Loader2 }
];

const AnalysisLoader = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate multi-step analysis
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(onComplete, 800); // Complete after final step shows briefly
        return prev;
      });
    }, 1500); // 1.5 seconds per step

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-fade-in w-full max-w-md">
      {/* Central Visualizer */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Pulsing ring backgrounds */}
        <div className="absolute w-32 h-32 bg-[#8B5CF6] rounded-full opacity-10 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-24 h-24 bg-[#8B5CF6] rounded-full opacity-20 animate-pulse" style={{ animationDuration: '2s' }}></div>
        
        {/* Core Icon */}
        <div className="relative bg-[#161B2E] border border-[#2A314A] w-20 h-20 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.2)] transform rotate-3">
          <BrainCircuit size={40} className="text-[#C4B5FD]" />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-8 text-white tracking-tight">AI is analyzing your profile</h3>

      <div className="w-full space-y-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const StepIcon = step.icon;
          
          return (
            <div 
              key={step.id} 
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                isActive 
                  ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 shadow-sm transform scale-[1.02]' 
                  : isCompleted 
                    ? 'bg-[#161B2E] border-[#2A314A] opacity-80' 
                    : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div className={`${isActive ? 'text-[#A78BFA]' : isCompleted ? 'text-[#10B981]' : 'text-gray-500'}`}>
                {isCompleted ? <CheckCircle2 size={22} className="text-[#10B981]" /> : 
                 isActive && index === steps.length - 1 ? <Loader2 size={22} className="animate-spin text-[#A78BFA]" /> : 
                 <StepIcon size={22} />}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisLoader;
