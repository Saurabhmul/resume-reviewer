import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Award, AlertTriangle, Lightbulb, CheckCircle2, TrendingUp, Download, RefreshCw, FileText, Loader2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ResumeTemplate from './ResumeTemplate';

// Define the worker for pdfjs to correctly parse PDFs in browser without crashing
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const mockReportData = {
  score: 68,
  summary: "Your resume has a strong foundation but lacks quantifiable achievements and contains some passive language that might not pass strict ATS filters.",
  strengths: [
    "Clear, logical chronological structure.",
    "Good use of industry-standard job titles.",
    "Education section is well-formatted and easy to read."
  ],
  weaknesses: [
    "Missing metrics: Only 20% of your bullet points contain numbers or percentages.",
    "Passive Verbs: 'Responsible for' and 'Helped with' weaken your impact.",
    "Keyword Optimization: Missing key industry terms like 'Agile', 'CI/CD', and 'Scalability'."
  ],
  suggestions: [
    { title: "Quantify Your Impact", desc: "Change 'Improved system performance' to 'Improved system performance by 35% using Redis caching'." },
    { title: "Use Strong Action Verbs", desc: "Replace 'Responsible for managing a team' with 'Spearheaded a cross-functional team of 6 engineers'." },
    { title: "Add a Core Competencies Section", desc: "Include a skills section near the top to guarantee you hit ATS keyword requirements." }
  ]
};

const FeedbackReport = ({ onReset, fileObject }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [generatedPdfBaseName, setGeneratedPdfBaseName] = useState("");
  const [parsedResumeData, setParsedResumeData] = useState(null);

  const scoreColor = mockReportData.score >= 80 ? 'text-[#10B981]' : 
                    mockReportData.score >= 60 ? 'text-[#F59E0B]' : 'text-[#EF4444]';
  
  const getScoreRingColor = () => {
    if (mockReportData.score >= 80) return '#10B981';
    if (mockReportData.score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const extractTextFromFile = async (file) => {
    if (!file) return "No content found.";
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lines = {};
          textContent.items.forEach(item => {
             const y = Math.round(item.transform[5]);
             // Find an existing line within 4 pixels vertically
             let matchedY = Object.keys(lines).find(key => Math.abs(Number(key) - y) < 4);
             if (!matchedY) {
                 matchedY = y;
                 lines[matchedY] = [];
             }
             lines[matchedY].push({...item, calcHeight: item.height || item.transform[3] || 10});
          });
          
          // PDF coordinates start from bottom, so sort Y descending
          const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
          
          sortedY.forEach(y => {
             const lineItems = lines[y];
             // Sort left-to-right
             lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
             
             let lineText = "";
             let lastX = null;
             lineItems.forEach(item => {
                 if (lastX !== null) {
                     const gap = item.transform[4] - lastX;
                     // If horizontal gap is roughly a space width (30% of font height)
                     if (gap > (item.calcHeight * 0.3)) { 
                         lineText += " ";
                     }
                 }
                 lineText += item.str;
                 lastX = item.transform[4] + item.width;
             });
             fullText += lineText.trim() + "\n";
          });
          fullText += "\n";
      }
      
      // Cleanup garbage characters from PDF extraction
      fullText = fullText.replace(/(%[A-Za-zÏï]|%\?)/g, '•');
      // Normalize LaTeX block artifacts (often renders as weird spacing or backslashes)
      fullText = fullText.replace(/[\\]/g, '');
      // Specifically fix CGPA math renderings like \frac{7.2}{10} if they exist
      fullText = fullText.replace(/\\frac\s*\{\s*([0-9.]+)\s*\}\s*\{\s*([0-9.]+)\s*\}/gi, '$1/$2');
      
      // Normalize multiple spaces
      fullText = fullText.replace(/ {2,}/g, ' ');
      
      return fullText;
    } else {
      return await file.text();
    }
  };

  const handleExportAnalysis = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("NovaresumeAI - Analysis Report", 105, 20, null, null, "center");
    
    doc.setDrawColor(200);
    doc.line(20, 25, 190, 25);
    
    doc.setFontSize(14);
    doc.text(`Overall ATS Score: ${mockReportData.score}/100`, 20, 35);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(mockReportData.summary, 170);
    doc.text(summaryLines, 20, 45);
    
    let yPos = 45 + (summaryLines.length * 6) + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("Strengths", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    mockReportData.strengths.forEach(str => {
      doc.text(`• ${str}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Critical Issues", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    mockReportData.weaknesses.forEach(wk => {
      doc.text(`• ${wk}`, 25, yPos);
      yPos += 6;
    });

    const baseName = fileObject ? fileObject.name.replace(/\.[^/.]+$/, "") : "Resume";
    
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}_analysis.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadOptimized = async () => {
    setIsGenerating(true);
    
    try {
      let originalText = "";
      let baseName = "Resume";
      
      if (fileObject) {
         originalText = await extractTextFromFile(fileObject);
         baseName = fileObject.name.replace(/\.[^/.]+$/, "");
      } else {
         originalText = "JOHN DOE\njohn.doe@example.com\n\nEXPERIENCE\nResponsible for managing team.\nHelped with product launch.";
      }

      // Simulate AI improvements based on the Gemini feedback in the UI
      // (Replacing passive words with strong action verbs)
      let improvedText = originalText
        .replace(/Responsible for/gi, "Spearheaded")
        .replace(/Helped with/gi, "Collaborated on")
        .replace(/Worked on/gi, "Engineered")
        .replace(/Managed/gi, "Directed cross-functional")
        // Exact user corrections for data accuracy and LaTeX cleanup
        .replace(/11\s*Crore/gi, "1 Crore")
        .replace(/[\\]/g, "") // Strip all stray backslashes
        .replace(/[%Ïï?]/g, ""); // Strip residual LaTeX or rendering artifacts

      // We generate the PDF synchronously after awaits so the browser recognizes this as a 
      // direct result of a user action thread
      
      const doc = new jsPDF();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate 900
      
      const rawLines = improvedText.split('\n').filter(l => l.trim().length > 0);
      let mergedLines = [];
      let currentLine = "";
      
      // 1. Sentence Stitching (fixing mid-sentence breaks)
      for (let i = 0; i < rawLines.length; i++) {
        let line = rawLines[i].trim();
        
        const isHeader = (line === line.toUpperCase() && line.length > 3 && line.length < 50) || 
                         line.match(/^(Professional Summary|Professional Experience|Experience|Education|Skills|Core Competencies|Activities)/i);
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.includes('•');
        const isSubHeader = !isBullet && !isHeader && line.length > 10 && line.length < 120 && (line.includes('|') || line.match(/\b20\d{2}\b/));
        
        if (isHeader || isBullet || isSubHeader || currentLine === "") {
          if (currentLine) mergedLines.push(currentLine);
          currentLine = line;
        } else {
          // If the previous line ends with terminal punctuation, don't merge, treat as new paragraph
          if (currentLine.match(/[.!?]$/)) {
            mergedLines.push(currentLine);
            currentLine = line;
          } else {
            // It's a wrapped sentence artifact from PDF extraction
            currentLine += " " + line;
          }
        }
      }
      if (currentLine) mergedLines.push(currentLine);

      // Parse merged lines into structured JSON for the HTML Template
      let data = { name: '', contact: [], sections: [] };
      if (mergedLines.length > 0) {
         data.name = mergedLines[0];
         if (mergedLines.length > 1) {
            data.contact = mergedLines[1].split('|').map(s => s.trim());
         }
         
         let currentSection = null;
         let currentItem = null;
         
         for (let i = 2; i < mergedLines.length; i++) {
            let line = mergedLines[i].trim();
            if (!line) continue;
            
            const isHeader = (line === line.toUpperCase() && line.length > 3 && line.length < 50) || 
                             line.match(/^(Professional Summary|Professional Experience|Experience|Education|Skills|Core Competencies|Activities)/i);
            if(isHeader) {
               currentSection = { title: line.toUpperCase(), items: [] };
               data.sections.push(currentSection);
               currentItem = null;
               continue;
            }
            
            if (!currentSection) {
               currentSection = { title: 'SUMMARY', items: [] };
               data.sections.push(currentSection);
            }
            
            const isSubHeader = !line.startsWith('•') && !line.startsWith('-') && !line.includes('•') && line.length > 10 && line.length < 120 && (line.includes('|') || line.match(/\b20\d{2}\b/));
            if (isSubHeader) {
               currentItem = { header: line, body: [] };
               currentSection.items.push(currentItem);
               continue;
            }
            
            let text = line.replace(/^[•\-\s]+/, ''); 
            if (!currentItem) {
               currentItem = { header: '', body: [] };
               currentSection.items.push(currentItem);
            }
            currentItem.body.push(text);
         }
      }

      // Mount data synchronously so DOM is ready for snapshot
      flushSync(() => {
          setParsedResumeData(data);
      });
      
      // Snapshot the cleanly rendered HTML template and convert to PDF
      setTimeout(async () => {
         try {
             const element = document.getElementById('resume-html-template');
             if (element) {
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                
                const pdf = new jsPDF('p', 'pt', 'letter');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                // Standard 1 page snapshot for simple resumes
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          
                const blob = pdf.output("blob");
                const url = URL.createObjectURL(blob);
                setGeneratedPdfBaseName(`${baseName}_optimized.pdf`);
                setPdfPreviewUrl(url); 
             }
         } catch(e) {
             console.error("Canvas rendering failed", e);
         } finally {
             setIsGenerating(false);
         }
      }, 100);
      
    } catch (error) {
       console.error("Failed to generate PDF:", error);
       setIsGenerating(false);
    }
  };

  const executeFinalDownload = () => {
    if (!pdfPreviewUrl) return;
    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = generatedPdfBaseName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePdfPreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  return (
    <div className="w-full flex flex-col font-inter">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-[#1E2541]">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Analysis Complete</h2>
          <p className="text-gray-400">Here is your tailored resume feedback powered by NovaresumeAI.</p>
        </div>
        <button 
          onClick={onReset}
          className="bg-[#161B2E] border border-[#2A314A] hover:bg-[#1E2541] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all transition-colors"
        >
          <RefreshCw size={16} className="text-gray-400" />
          Review Another
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Score Card */}
        <div className="bg-[#0E121E] border border-[#1E2541] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#161B2E]/50 to-transparent pointer-events-none"></div>
          <h3 className="text-gray-400 font-medium mb-6 relative z-10 text-sm tracking-wide uppercase">Overall ATS Score</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6 relative z-10">
            {/* Background Track */}
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-[#1A1F35]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                stroke={getScoreRingColor()}
                strokeDasharray={`${mockReportData.score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${getScoreRingColor()}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-5xl font-bold tracking-tighter ${scoreColor}`}>{mockReportData.score}</span>
            </div>
          </div>
          <p className="text-[#F59E0B] font-medium bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-4 py-1.5 text-sm rounded-full relative z-10">
            Needs Improvement
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-[#0E121E] border border-[#1E2541] rounded-2xl p-8 lg:col-span-2 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6] opacity-[0.03] blur-[80px] rounded-full pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-[#8B5CF6]/20 p-2 rounded-lg border border-[#8B5CF6]/30">
                <TrendingUp className="text-[#C4B5FD]" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white tracking-tight">Executive Summary</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-[15px]">
              {mockReportData.summary}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#1E2541]">
            <button 
              onClick={handleExportAnalysis}
              className="bg-[#161B2E] border border-[#2A314A] hover:bg-[#1E2541] text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Export Analysis PDF
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="bg-[#121629] border border-[#10B981]/20 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#10B981]/10 p-2 rounded-lg border border-[#10B981]/20">
              <Award className="text-[#10B981]" size={20} />
            </div>
            <h4 className="font-semibold text-lg text-white tracking-tight">What You Did Well</h4>
          </div>
          <ul className="space-y-4">
            {mockReportData.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-4 text-[15px] text-gray-300">
                <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0 mt-0.5 opacity-80" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-[#121629] border border-[#EF4444]/20 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-[#EF4444]/10 p-2 rounded-lg border border-[#EF4444]/20">
              <AlertTriangle className="text-[#EF4444]" size={20} />
            </div>
            <h4 className="font-semibold text-lg text-white tracking-tight">Critical Issues</h4>
          </div>
          <ul className="space-y-4">
            {mockReportData.weaknesses.map((item, idx) => (
              <li key={idx} className="flex gap-4 text-[15px] text-gray-300">
                <AlertTriangle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5 opacity-80" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions & Resume Generator */}
      <div className="bg-[#0E121E] border border-[#1E2541] rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-[#1E2541] gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#F59E0B]/10 p-2 rounded-lg border border-[#F59E0B]/20">
               <Lightbulb className="text-[#F59E0B]" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Actionable Steps to Improve</h3>
          </div>
          
          <button 
            onClick={handleDownloadOptimized}
            disabled={isGenerating}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-70 disabled:hover:bg-[#8B5CF6] text-white px-6 py-3 rounded-xl font-medium text-sm inline-flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(139,92,246,0.39)]"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileText size={18} />
            )}
            Download AI-Optimized Resume
          </button>
        </div>
        
        <div className="space-y-6">
          {mockReportData.suggestions.map((suggestion, idx) => (
            <div key={idx} className="flex gap-5 group">
              <div className="bg-[#161B2E] h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[#A78BFA] border border-[#2A314A] shadow-sm transform transition-transform group-hover:scale-110">
                {idx + 1}
              </div>
              <div>
                <h5 className="font-semibold text-white text-[16px] mb-1.5">{suggestion.title}</h5>
                <p className="text-[15px] text-gray-400 leading-relaxed">{suggestion.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen PDF Preview Viewport */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col pt-4 px-4 pb-4 animate-fade-in">
          <div className="w-full max-w-5xl mx-auto flex justify-between items-center bg-[#0E121E] border border-[#1E2541] rounded-t-xl p-4 shadow-xl">
            <h3 className="text-white font-medium flex items-center gap-2">
              <FileText size={18} className="text-[#8B5CF6]"/>
              Resume Preview
            </h3>
            <div className="flex gap-3">
               <button 
                onClick={closePdfPreview}
                className="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={executeFinalDownload}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
          <div className="w-full max-w-5xl mx-auto flex-1 bg-white rounded-b-xl overflow-hidden shadow-2xl relative">
            <iframe 
               src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
               title="PDF Preview"
               className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
      {/* Hidden Render Template for html2canvas snapshot */}
      <ResumeTemplate data={parsedResumeData} />
    </div>
  );
};

export default FeedbackReport;
