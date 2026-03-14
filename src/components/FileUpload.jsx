import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, X } from 'lucide-react';

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    setError(null);
    if (!file) return false;
    
    const validTypes = ['application/pdf', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError("Please upload a PDF or TXT file.");
      return false;
    }
    
    // Check max size (5MB mock limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`relative rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 ease-in-out bg-[#0E121E] border-2 border-dashed ${
          dragActive 
            ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.1)]' 
            : 'border-[#2A314A] hover:border-[#8B5CF6]/50 hover:bg-[#161B2E]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept=".pdf,.txt,application/pdf,text/plain" 
          onChange={handleChange} 
        />
        
        {/* Upload Icon Container */}
        <div className="bg-[#1A1F35] border border-[#2A314A] p-5 rounded-full mb-6 shadow-inner transition-transform group-hover:scale-110">
          <UploadCloud size={40} className="text-[#A78BFA]" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-white">Drag & drop your resume here</h3>
        <p className="text-gray-400 text-sm mb-8 text-center max-w-sm leading-relaxed">
          Supported files: PDF, TXT. Max size: 5MB.<br/>
          We'll analyze your resume for ATS compatibility and impact.
        </p>
        
        <button 
          className="bg-transparent border border-[#2A314A] hover:bg-[#2A314A] text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors duration-200"
          onClick={onButtonClick}
        >
          <File size={18} className="text-[#8B5CF6]" />
          Browse Files
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-between animate-fade-in hidden">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
