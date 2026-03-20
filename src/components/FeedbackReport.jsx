import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Award, AlertTriangle, Lightbulb, CheckCircle2, TrendingUp, Download, RefreshCw, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ResumeTemplate from './ResumeTemplate';
import { extractTextFromFile, structureAndRewriteResume } from '../utils/gemini';

const FeedbackReport = ({ onReset, fileObject, analysisData, analysisError }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [generatedPdfBaseName, setGeneratedPdfBaseName] = useState("");
  const [parsedResumeData, setParsedResumeData] = useState(null);

  if (analysisError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-10 flex flex-col items-center gap-4 max-w-lg text-center">
          <AlertCircle size={40} className="text-red-400" />
          <h2 className="text-xl font-bold text-white">Analysis Failed</h2>
          <p className="text-red-300 text-sm leading-relaxed">{analysisError}</p>
          <button
            onClick={onReset}
            className="mt-4 bg-[#161B2E] border border-[#2A314A] hover:bg-[#1E2541] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} className="text-gray-400" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

  const scoreColor = analysisData.score >= 80 ? 'text-[#10B981]' :
    analysisData.score >= 60 ? 'text-[#F59E0B]' : 'text-[#EF4444]';

  const getScoreRingColor = () => {
    if (analysisData.score >= 80) return '#10B981';
    if (analysisData.score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = () => {
    if (analysisData.score >= 80) return { text: 'Strong Resume', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/20' };
    if (analysisData.score >= 60) return { text: 'Needs Improvement', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20' };
    return { text: 'Significant Issues', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10 border-[#EF4444]/20' };
  };

  const scoreLabel = getScoreLabel();

  const handleExportAnalysis = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("NovaresumeAI - Analysis Report", 105, 20, null, null, "center");

    doc.setDrawColor(200);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(14);
    doc.text(`Overall ATS Score: ${analysisData.score}/100`, 20, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysisData.summary, 170);
    doc.text(summaryLines, 20, 45);

    let yPos = 45 + (summaryLines.length * 6) + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Strengths", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    analysisData.strengths.forEach(str => {
      const lines = doc.splitTextToSize(`• ${str}`, 165);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 6;
    });

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Critical Issues", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    analysisData.weaknesses.forEach(wk => {
      const lines = doc.splitTextToSize(`• ${wk}`, 165);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 6;
    });

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Suggestions", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 8;
    analysisData.suggestions.forEach(s => {
      doc.setFont("helvetica", "bold");
      doc.text(`${s.title}:`, 25, yPos);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(s.desc, 160);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 6 + 4;
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
      }

      if (!originalText.trim()) {
        throw new Error("Could not extract text from the uploaded file.");
      }

      // Gemini parses + rewrites the resume into a typed structured JSON
      const structuredData = await structureAndRewriteResume(originalText);

      flushSync(() => {
        setParsedResumeData(structuredData);
      });

      setTimeout(async () => {
        try {
          const element = document.getElementById('resume-html-template');
          if (element) {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });

            const pdf = new jsPDF('p', 'pt', 'letter');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();

            const canvasScale = canvas.width / element.offsetWidth;

            // Margins in PDF points
            const topMarginPt = 36;
            const bottomMarginPt = 36;

            // Usable canvas pixels per page (leave room for top+bottom margins on continuation pages)
            const usableHeightPt = pdfPageHeight - topMarginPt - bottomMarginPt;
            const canvasPageHeight = Math.floor(usableHeightPt * canvas.width / pdfWidth);

            // Only measure individual entry blocks (not full section wrappers)
            // so the snap-back is tight and never causes huge whitespace gaps
            const elementTop = element.getBoundingClientRect().top;
            const blockEls = Array.from(element.querySelectorAll('[data-block="entry"]'));
            const blockRanges = blockEls.map(el => {
              const r = el.getBoundingClientRect();
              return {
                top:    Math.floor((r.top    - elementTop) * canvasScale),
                bottom: Math.ceil ((r.bottom - elementTop) * canvasScale),
              };
            });

            // Snap the cut to just before any entry that straddles the candidate Y
            const findSafeBreak = (candidateY) => {
              for (const { top, bottom } of blockRanges) {
                if (top < candidateY && candidateY < bottom) {
                  return Math.max(0, top - 4);
                }
              }
              return candidateY;
            };

            // Build cut points
            const cuts = [0];
            let pos = 0;
            while (pos + canvasPageHeight < canvas.height) {
              const safeY = findSafeBreak(pos + canvasPageHeight);
              const nextPos = safeY > pos ? safeY : pos + canvasPageHeight;
              cuts.push(nextPos);
              pos = nextPos;
            }
            cuts.push(canvas.height);

            for (let i = 0; i < cuts.length - 1; i++) {
              const sliceY = cuts[i];
              const sliceH = cuts[i + 1] - sliceY;

              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = sliceH;
              const ctx = pageCanvas.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

              const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
              const pageImgHeight = (sliceH * pdfWidth) / canvas.width;

              if (i > 0) pdf.addPage();
              // Page 1: template already has 64px internal padding at top (≈48pt) — place at Y=0
              // Continuation pages: add explicit top margin so content doesn't start at the edge
              const yOffsetPt = i === 0 ? 0 : topMarginPt;
              pdf.addImage(pageImgData, 'JPEG', 0, yOffsetPt, pdfWidth, pageImgHeight);
            }

            const blob = pdf.output("blob");
            const url = URL.createObjectURL(blob);
            setGeneratedPdfBaseName(`${baseName}_optimized.pdf`);
            setPdfPreviewUrl(url);
          }
        } catch (e) {
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
                strokeDasharray={`${analysisData.score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${getScoreRingColor()}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-5xl font-bold tracking-tighter ${scoreColor}`}>{analysisData.score}</span>
            </div>
          </div>
          <p className={`font-medium border px-4 py-1.5 text-sm rounded-full relative z-10 ${scoreLabel.color} ${scoreLabel.bg}`}>
            {scoreLabel.text}
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
              {analysisData.summary}
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
            {analysisData.strengths.map((item, idx) => (
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
            {analysisData.weaknesses.map((item, idx) => (
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
          {analysisData.suggestions.map((suggestion, idx) => (
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
              <FileText size={18} className="text-[#8B5CF6]" />
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
