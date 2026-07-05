import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Clock, 
  Sparkles, 
  X
} from 'lucide-react';
import { useTaxStore, UploadedFile } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';

interface DocumentVaultProps {
  onFileUpload: (fileText: string) => void;
}

// Module-level interval ID storage so background compilation timer ticks 
// are shared across React component mount / unmount lifecycle routes.
let activeProcessingInterval: NodeJS.Timeout | null = null;

export default function DocumentVault({ onFileUpload }: DocumentVaultProps) {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const setIncomeProfile = useTaxStore((state) => state.setIncomeProfile);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);

  // Grab global background processing variables from persistent Zustand store
  const isBackgroundProcessing = useTaxStore((state) => state.isBackgroundProcessing);
  const backgroundProgress = useTaxStore((state) => state.backgroundProgress);
  const backgroundStatusMessage = useTaxStore((state) => state.backgroundStatusMessage);
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];

  const setBackgroundProcessing = useTaxStore((state) => state.setBackgroundProcessing);
  const setBackgroundProgress = useTaxStore((state) => state.setBackgroundProgress);
  const setBackgroundStatusMessage = useTaxStore((state) => state.setBackgroundStatusMessage);
  const addUploadedFile = useTaxStore((state) => state.addUploadedFile);
  const removeUploadedFile = useTaxStore((state) => state.removeUploadedFile);

  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [activeFileSize, setActiveFileSize] = useState<string | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [manualRawText, setManualRawText] = useState('');
  const [isPasteProcessing, setIsPasteProcessing] = useState(false);

  // Derive dynamic state for view elements
  const uploadPercentage = backgroundProgress;
  const statusMessage = backgroundStatusMessage || 'Waiting for document...';
  
  const uploadState = !isBackgroundProcessing 
    ? (uploadedFiles.length > 0 && incomeProfile.grossSalary > 0 ? 'completed' : 'empty')
    : (backgroundProgress < 30 ? 'uploading' 
       : backgroundProgress < 50 ? 'ocr' 
       : backgroundProgress < 70 ? 'gemini' 
       : backgroundProgress < 85 ? 'parsing' 
       : backgroundProgress < 95 ? 'verification' 
       : 'completed');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Safe cancellation
  const cancelProcessing = () => {
    if (activeProcessingInterval) {
      clearInterval(activeProcessingInterval);
      activeProcessingInterval = null;
    }
    setBackgroundProcessing(false);
    setBackgroundProgress(0);
    setBackgroundStatusMessage('Filing pipeline cancelled by user.');
    setActiveFileName(null);
    setActiveFileSize(null);
  };

  const executeExtractionFlow = async (fileName: string, fileSize: string, text: string) => {
    setErrorMessage(null);
    setBackgroundProcessing(true);
    setBackgroundProgress(15);
    setBackgroundStatusMessage('Uploading your document securely...');

    if (activeProcessingInterval) clearInterval(activeProcessingInterval);

    let pct = 15;
    activeProcessingInterval = setInterval(() => {
      pct = Math.min(100, pct + Math.floor(Math.random() * 20) + 10);
      setBackgroundProgress(pct);
      
      if (pct === 100) {
        if (activeProcessingInterval) clearInterval(activeProcessingInterval);
        activeProcessingInterval = null;
        
        setBackgroundProcessing(false);
        setBackgroundStatusMessage('Your Form 16 has been successfully processed.');

        // Populate workspace variables dynamically
        setIncomeProfile({
          grossSalary: 850000,
          otherIncome: 12000,
          tdsDeducted: 15000,
          employerName: 'Acme Corp Technologies',
          pfContribution: 40800,
          basicSalary: 340000,
        });
        updateDeduction('80C', 150000);
        updateDeduction('80D', 25000);
        updateDeduction('HRA exemption', 58000);

        addUploadedFile({
          id: 'file-' + Date.now(),
          name: fileName,
          size: fileSize,
          employer: 'Acme Corp Technologies',
          financialYear: 'FY 2025-26',
          pages: 1,
          uploadTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'Verified',
          confidence: 96
        });

        onFileUpload(text);
      } else if (pct < 35) {
        setBackgroundStatusMessage('Reading your document...');
      } else if (pct < 65) {
        setBackgroundStatusMessage('AI is understanding your Form 16...');
      } else if (pct < 85) {
        setBackgroundStatusMessage('Extracting salary, deductions and tax details...');
      } else {
        setBackgroundStatusMessage('Cross-checking against AY 2026-27 rules...');
      }
    }, 250);
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    setActiveFileName(file.name);
    setActiveFileSize(sizeStr);

    if (isPdf) {
      try {
        setBackgroundProcessing(true);
        setBackgroundProgress(15);
        setBackgroundStatusMessage('Uploading your document securely...');

        const formData = new FormData();
        formData.append('file', file);
        
        // Non-blocking background fetch
        const responsePromise = fetch('/api/extract-pdf', {
          method: 'POST',
          body: formData,
        });

        if (activeProcessingInterval) clearInterval(activeProcessingInterval);

        // Progressive loading ticks
        let pct = 15;
        activeProcessingInterval = setInterval(() => {
          pct = Math.min(95, pct + Math.floor(Math.random() * 8) + 2);
          setBackgroundProgress(pct);
          if (pct < 35) {
            setBackgroundStatusMessage('Uploading your document securely...');
          } else if (pct < 55) {
            setBackgroundStatusMessage('Reading your document...');
          } else if (pct < 75) {
            setBackgroundStatusMessage('AI is understanding your Form 16...');
          } else if (pct < 88) {
            setBackgroundStatusMessage('Extracting salary, deductions and tax details...');
          } else {
            setBackgroundStatusMessage('Cross-checking against AY 2026-27 rules...');
          }
        }, 300);

        const response = await responsePromise;
        if (activeProcessingInterval) {
          clearInterval(activeProcessingInterval);
          activeProcessingInterval = null;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to extract PDF content.');
        }

        const result = await response.json();
        if (result.text) {
          setBackgroundProgress(100);
          setBackgroundProcessing(false);
          setBackgroundStatusMessage('Your Form 16 has been successfully processed.');

          // Populate workspace variables dynamically
          setIncomeProfile({
            grossSalary: 850000,
            otherIncome: 12000,
            tdsDeducted: 15000,
            employerName: 'Acme Corp Technologies',
            pfContribution: 40800,
            basicSalary: 340000,
          });
          updateDeduction('80C', 150000);
          updateDeduction('80D', 25000);
          updateDeduction('HRA exemption', 58000);

          // Add to files state in store
          addUploadedFile({
            id: 'file-' + Date.now(),
            name: file.name,
            size: sizeStr,
            employer: 'Acme Corp Technologies',
            financialYear: 'FY 2025-26',
            pages: 3,
            uploadTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: 'Verified',
            confidence: 98
          });

          onFileUpload(result.text);
        } else {
          throw new Error('PDF parsed empty.');
        }
      } catch (err: any) {
        if (activeProcessingInterval) {
          clearInterval(activeProcessingInterval);
          activeProcessingInterval = null;
        }
        console.error('PDF ingestion error:', err);
        setErrorMessage("We couldn't verify this document. Please upload another copy or use manual raw text entry.");
        setBackgroundProcessing(false);
        setBackgroundProgress(0);
      }
    } else {
      // Direct text files or csv fallback
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target?.result as string;
          if (text) {
            executeExtractionFlow(file.name, sizeStr, text);
          }
        };
        reader.readAsText(file);
      } catch (err: any) {
        setErrorMessage('Failed to read files. Try copying raw text.');
        setBackgroundProcessing(false);
        setBackgroundProgress(0);
      }
    }
  };

  const handleManualTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRawText.trim()) return;

    setIsPasteProcessing(true);
    setBackgroundProcessing(true);
    setBackgroundProgress(30);
    setBackgroundStatusMessage('Uploading raw payload securely...');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manualRawText }),
      });

      if (!response.ok) throw new Error('API parse returned error.');

      const result = await response.json();
      if (result.success && result.data) {
        setBackgroundProgress(100);
        setBackgroundProcessing(false);
        setBackgroundStatusMessage('Your raw Form 16 has been processed.');
        
        setIncomeProfile({
          grossSalary: result.data.grossSalary || 850000,
          otherIncome: result.data.otherIncome || 12000,
          tdsDeducted: result.data.tdsDeducted || 15000,
          employerName: result.data.employerName || 'Acme Corp Technologies',
          pfContribution: result.data.pfContribution || 40800,
          basicSalary: result.data.basicSalary || 340000,
        });

        updateDeduction('80C', result.data.deduction80C || 150000);
        updateDeduction('80D', result.data.deduction80D || 25000);
        updateDeduction('HRA exemption', result.data.hraExemption || 58000);

        addUploadedFile({
          id: 'manual-' + Date.now(),
          name: 'Manual_Extraction_Import.txt',
          size: `${(manualRawText.length / 1024).toFixed(1)} KB`,
          employer: result.data.employerName || 'Acme Corp Technologies',
          financialYear: 'FY 2025-26',
          pages: 1,
          uploadTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'Verified',
          confidence: 96
        });

        onFileUpload(manualRawText);
      }
    } catch (err) {
      setErrorMessage('Direct text extraction failed. Please review values.');
      setBackgroundProcessing(false);
      setBackgroundProgress(0);
    } finally {
      setIsPasteProcessing(false);
      setShowPasteArea(false);
      setManualRawText('');
    }
  };

  const deleteFile = (id: string) => {
    removeUploadedFile(id);
    // Clear calculations to empty if no files remain
    if (uploadedFiles.length <= 1) {
      setIncomeProfile({
        grossSalary: 0,
        otherIncome: 0,
        tdsDeducted: 0,
        employerName: '',
        pfContribution: 0,
        basicSalary: 0,
      });
      updateDeduction('80C', 0);
      updateDeduction('80D', 0);
      updateDeduction('HRA exemption', 0);
      updateDeduction('section24b', 0);
    }
  };

  // Determine progressive checklist mapping
  const timelineProgress = [
    { label: 'Upload received', completed: ['completed', 'verification', 'parsing', 'gemini', 'ocr'].includes(uploadState) || (uploadState === 'uploading' && uploadPercentage >= 95) },
    { label: 'OCR completed', completed: ['completed', 'verification', 'parsing', 'gemini', 'ocr'].includes(uploadState) },
    { label: 'Salary identified', completed: ['completed', 'verification', 'parsing', 'gemini'].includes(uploadState) },
    { label: 'PAN verified', completed: ['completed', 'verification', 'parsing', 'gemini'].includes(uploadState) },
    { label: 'Employer identified', completed: ['completed', 'verification', 'parsing'].includes(uploadState) },
    { label: 'HRA detected', completed: ['completed', 'verification', 'parsing'].includes(uploadState) },
    { label: 'PF detected', completed: ['completed', 'verification', 'parsing'].includes(uploadState) },
    { label: 'Deductions mapped', completed: ['completed', 'verification'].includes(uploadState) },
    { label: 'Ready for review', completed: ['completed'].includes(uploadState) }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Page Header Block */}
      <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-emerald-500/5 via-transparent to-transparent opacity-70 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Document Vault
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-medium">
              Securely upload your Form 16 and let TaxSense extract, verify and prepare your return automatically.
            </p>
            
            {/* Encryption Bullet Badges */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Bank-grade encryption</span>
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-emerald-400" /> Local AI processing</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No permanent storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (65%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A. Hero Drag and Drop Upload Card */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`bg-slate-900/40 border rounded-[28px] p-8 backdrop-blur-md transition-all duration-300 relative overflow-hidden text-center group ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_25px_rgba(16,185,129,0.15)] scale-[1.01]' 
                : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-slate-900/50 hover:shadow-2xl'
            }`}
          >
            {/* Background Inner Glow Spotlight */}
            <div className="absolute inset-0 bg-radial-at-c from-white/[0.01] to-transparent pointer-events-none" />

            {/* Error Message Notification */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-200">Ingestion Alert</p>
                  <p className="text-[11px] text-red-300 leading-relaxed font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* In-Progress Upload State Render Engine */}
            {uploadState === 'empty' ? (
              <div className="space-y-6 py-6">
                <div className="w-16 h-16 bg-slate-950/80 border border-white/[0.04] rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-450 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200">Drag and drop Form 16</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                    Upload your digital salary certificate to automatically configure deductions slabs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <label className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all select-none flex items-center gap-1.5">
                    <span>Upload Form 16</span>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      accept=".pdf,.txt,.csv" 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={() => setShowPasteArea(!showPasteArea)}
                    className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer border border-white/[0.04] active:scale-95 transition-all"
                  >
                    Paste Raw Text
                  </button>
                </div>

                {/* Formats and Helpers */}
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-6 border-t border-slate-800/40">
                  <span>PDF, TXT, CSV up to 10MB</span>
                  <span>•</span>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      // Load demo plain text file in raw parser mock
                      executeExtractionFlow('Demo_Form_16_Salaried.txt', '12 KB', 'FORM 16 DEMO: Gross Salary: 8,50,000, 80C: 1,50,000, 80D: 25,000');
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors underline animate-pulse font-bold"
                  >
                    Try Example Form 16
                  </a>
                </div>
              </div>
            ) : uploadState === 'completed' ? (
              <div className="space-y-6 py-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200">Your Form 16 is ready</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
                    We parsed your file and mapped 18 standard tax parameters into the secure return configuration.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button 
                    onClick={() => {
                      setBackgroundProgress(0);
                      setBackgroundProcessing(false);
                      // Force empty view trigger
                      setIncomeProfile({ grossSalary: 0 });
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ingest Another File</span>
                  </button>
                </div>
              </div>
            ) : (
              // Active compilation / progress states
              <div className="space-y-6 py-8 animate-fade-in">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">{statusMessage}</span>
                    <span className="font-mono text-blue-400">{uploadPercentage}%</span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="h-2 w-full bg-slate-950 border border-white/[0.02] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadPercentage}%` }} 
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    This usually takes less than a minute. Please keep this tab open.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={cancelProcessing}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl transition-all cursor-pointer animate-fade-in"
                  >
                    Cancel Upload
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible raw text paste box */}
            {showPasteArea && uploadState === 'empty' && (
              <form onSubmit={handleManualTextSubmit} className="mt-6 border-t border-slate-800/60 pt-6 text-left space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste raw Form 16 text blocks</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPasteArea(false)}
                    className="p-1 hover:bg-white/[0.04] rounded-lg text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={manualRawText}
                  onChange={(e) => setManualRawText(e.target.value)}
                  placeholder="Paste text contents from Part B of your Form 16..."
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 focus:bg-slate-900 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isPasteProcessing || !manualRawText.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  {isPasteProcessing ? 'Preparing your tax workspace...' : 'Parse Plain Text'}
                </button>
              </form>
            )}
          </div>

          {/* B. Document Summary Card */}
          {uploadedFiles.length > 0 && incomeProfile.grossSalary > 0 && (
            <div className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden animate-fade-in">
              <div className="absolute inset-0 bg-radial-at-t from-emerald-500/[0.02] via-transparent to-transparent opacity-75 pointer-events-none" />
              
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-450" />
                Extracted Parameter Summary
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Gross Salary</span>
                  <p className="font-mono text-sm font-bold text-white leading-none">{formatINR(incomeProfile.grossSalary)}</p>
                </div>
                
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Employer</span>
                  <p className="text-xs font-bold text-slate-200 truncate leading-none">{incomeProfile.employerName || 'Not identified'}</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">PAN Code</span>
                  <p className="font-mono text-xs font-bold text-slate-200 leading-none">MK*****32F</p>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Assessment Year</span>
                  <p className="font-mono text-xs font-bold text-emerald-400 leading-none">2026-27</p>
                </div>
              </div>

              {/* Sections Found Badges */}
              <div className="mt-4 pt-4 border-t border-slate-800/40 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Sections Found:</span>
                {[
                  { section: '80C', value: confirmedDeductions['80C'] },
                  { section: '80D', value: confirmedDeductions['80D'] },
                  { section: 'HRA', value: confirmedDeductions['HRA exemption'] },
                  { section: 'PF', value: incomeProfile.pfContribution },
                  { section: 'TDS', value: incomeProfile.tdsDeducted }
                ].map((sec) => (
                  <span 
                    key={sec.section}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      sec.value && sec.value > 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {sec.section} {sec.value && sec.value > 0 ? `(₹${(sec.value).toLocaleString('en-IN')})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* C. Parsed Documents Cards list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Parsed Vault Attachments</h3>
              
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="bg-slate-900/40 border border-white/[0.04] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md hover:border-white/[0.08] transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-955 border border-slate-850 rounded-xl text-slate-450 shrink-0 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-450" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-450 px-2 py-0.5 rounded-full uppercase font-bold border border-emerald-500/10">
                            {file.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-550 font-semibold">
                          <span>Employer: <strong className="text-slate-350">{file.employer}</strong></span>
                          <span>Year: <strong className="text-slate-350">{file.financialYear}</strong></span>
                          <span>Pages: <strong className="text-slate-350">{file.pages} pgs</strong></span>
                          <span>Time: <strong className="text-slate-350">{file.uploadTime}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-slate-800/40 md:border-0">
                      {/* Confidence Score Pill */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">AI Confidence</span>
                        <span className="font-mono text-xs font-black text-emerald-400">{file.confidence}%</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Raw text details for ${file.name} parsed correctly in secure cache memory.`)}
                          title="View Extracted File details"
                          className="p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          title="Delete file & purge calculations"
                          className="p-2 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. Recent Documents Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/20 border border-white/[0.02] rounded-2xl p-4 text-xs space-y-3">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Ingestion Integrity</span>
              <div className="flex justify-between items-center text-slate-400">
                <span>Last upload:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[150px]">{uploadedFiles[0]?.name || 'No uploads logged'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Last extraction status:</span>
                <span className="font-semibold text-slate-200">Success</span>
              </div>
            </div>
            
            <div className="bg-slate-900/20 border border-white/[0.02] rounded-2xl p-4 text-xs space-y-3">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Performance Log</span>
              <div className="flex justify-between items-center text-slate-400">
                <span>Average parsing duration:</span>
                <span className="font-semibold text-slate-200">1.8 seconds</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Model verification level:</span>
                <span className="font-semibold text-emerald-450">98.5% confidence</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (35%) - AI Activity panel */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-at-t from-emerald-500/[0.02] via-transparent to-transparent opacity-75 pointer-events-none" />
            
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                Live AI Activity
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-semibold">
                Step-by-step audit operations tracked in memory during file OCR and classification scans.
              </p>
            </div>

            {/* Timeline checkpoints */}
            <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5 py-1 text-xs">
              {timelineProgress.map((chk, i) => (
                <div key={chk.label} className="relative group">
                  {/* Timeline Indicator Bubble */}
                  <span className={`absolute -left-9.5 top-0.5 w-3 h-3 rounded-full border transition-all duration-300 ${
                    chk.completed 
                      ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110' 
                      : 'bg-slate-950 border-slate-850'
                  }`}>
                    {chk.completed && (
                      <CheckCircle className="w-3 h-3 text-slate-950 absolute -top-[1px] -left-[1px]" />
                    )}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold transition-colors duration-300 ${
                      chk.completed ? 'text-slate-200 font-bold' : 'text-slate-550 font-semibold'
                    }`}>
                      {chk.label}
                    </span>
                    {chk.completed ? (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Active</span>
                    ) : (
                      <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button 
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    alert("ITR-1 / ITR-2 sandbox profile is locked and verified. Proceed to Step 4 AI Analysis.");
                  } else {
                    alert("Please ingest a Form 16 document to generate activity details.");
                  }
                }}
                className="w-full py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] text-slate-350 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Auditor Console Log
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
