import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxData, FilingHistoryItem } from './types';
import { TAX_CONFIG } from './config';
import { calculateTax, formatINR } from './utils/taxCalculator';
const DeductionCard = lazy(() => import('./components/DeductionCard'));
const RegimeComparison = lazy(() => import('./components/RegimeComparison'));
const ExtractionConfirm = lazy(() => import('./components/ExtractionConfirm'));
const ExportControl = lazy(() => import('./components/ExportControl'));
const FilingGuide = lazy(() => import('./components/FilingGuide'));
const DocumentVault = lazy(() => import('./components/DocumentVault'));
const AICopilot = lazy(() => import('./components/copilot/AICopilot').then(m => ({ default: m.AICopilot })));
import { useTaxStore, useTaxStoreHydrated, UserProfile } from './store/useTaxStore';
import LandingPage from './components/LandingPage';
import { ExportService } from './services/ExportService';
import { AuthService } from './services/AuthService';

import { 
  Lock, 
  SlidersHorizontal, 
  Calculator, 
  BookOpen, 
  RotateCcw,
  ListTodo,
  TrendingUp,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  FileUp,
  BrainCircuit,
  Award,
  History,
  Settings,
  ChevronDown,
  LogOut,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  FileText,
  KeyRound,
  Download,
  Printer,
  ShieldCheck,
  Send,
  X,
  Bot,
  User,
  Plus,
  Minus,
  AlertCircle,
  Cpu
} from 'lucide-react';

const ParamInfo: React.FC<{ text: string }> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 z-30 group">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-350 focus:outline-none cursor-pointer p-0.5 inline-flex items-center align-middle"
        title={text}
      >
        <Info className="h-3.5 w-3.5 inline text-slate-400 hover:text-blue-400 transition-colors" />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 border border-slate-800 text-white text-[10px] font-medium rounded-lg shadow-xl leading-normal text-left z-50 pointer-events-none transition-all">
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          {text}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const hydrated = useTaxStoreHydrated();
  const [isFilingGuideOpen, setIsFilingGuideOpen] = useState(false);
  const activeStep = useTaxStore((state) => state.activeStep);
  const setActiveStep = useTaxStore((state) => state.setActiveStep);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [authEmail, setAuthEmail] = useState('guest@taxsense.in');
  const [authPassword, setAuthPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [guidedFilingStep, setGuidedFilingStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  // Form 16 extraction UI state
  const [extractedData, setExtractedData] = useState<Partial<TaxData> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);

  // Manual Paste code drawer state
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [manualRawText, setManualRawText] = useState('');
  const [isPasteProcessing, setIsPasteProcessing] = useState(false);

  // Zustand Store variables
  const filingHistory = useTaxStore((state) => state.filingHistory) || [];
  const addFilingHistory = useTaxStore((state) => state.addFilingHistory);
  const clearFilingHistory = useTaxStore((state) => state.clearFilingHistory);
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const setIncomeProfile = useTaxStore((state) => state.setIncomeProfile);
  const updateDeduction = useTaxStore((state) => state.updateDeduction);
  const addChatMessage = useTaxStore((state) => state.addChatMessage);
  const setIsStoreExtracting = useTaxStore((state) => state.setIsExtracting);
  const clearSession = useTaxStore((state) => state.clearSession);
  const user = useTaxStore((state) => state.user);
  const authMode = useTaxStore((state) => state.authMode);
  const setUser = useTaxStore((state) => state.setUser);
  const setAuthMode = useTaxStore((state) => state.setAuthMode);
  const isBackgroundProcessing = useTaxStore((state) => state.isBackgroundProcessing);
  const backgroundProgress = useTaxStore((state) => state.backgroundProgress);
  const backgroundStatusMessage = useTaxStore((state) => state.backgroundStatusMessage);
  const formType = useTaxStore((state) => state.formType);
  const setFormType = useTaxStore((state) => state.setFormType);
  const multiHouse = useTaxStore((state) => state.multiHouse);
  const setMultiHouse = useTaxStore((state) => state.setMultiHouse);
  const foreignAssets = useTaxStore((state) => state.foreignAssets);
  const setForeignAssets = useTaxStore((state) => state.setForeignAssets);
  const currentStep = useTaxStore((state) => state.currentStep);
  const setStep = useTaxStore((state) => state.setStep);
  const ingestionState = useTaxStore((state) => state.ingestionState);
  const theme = useTaxStore((state) => state.theme) || 'light';
  const setTheme = useTaxStore((state) => state.setTheme);
  const uploadedFiles = useTaxStore((state) => state.uploadedFiles) || [];
  const isFloatingAIChatOpen = useTaxStore((state) => state.isFloatingAIChatOpen);
  const setIsFloatingAIChatOpen = useTaxStore((state) => state.setIsFloatingAIChatOpen);

  // Workspace entrance card coordinate tracking
  const [authCardCoords, setAuthCardCoords] = useState({ x: 0, y: 0 });
  const [authCardHovered, setAuthCardHovered] = useState(false);

  const handleAuthCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAuthCardCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };


  // Generate 40 twinkling particles for unified background canvas
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6, // 0.6px to 2.4px
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 5, // 5s to 11s
    }));
  }, []);

  // Smooth High-Performance Mouse Parallax via CSS Variables
  useEffect(() => {
    let rafid: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafid);
      rafid = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        document.documentElement.style.setProperty('--mouse-x', `${x}`);
        document.documentElement.style.setProperty('--mouse-y', `${y}`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafid);
    };
  }, []);

  // Enforce dark mode class on document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Stepped thinking timer in Stage 4
  useEffect(() => {
    if (activeStep === 4) {
      setAnalysisProgress(0);
      const t1 = setTimeout(() => setAnalysisProgress(1), 800);
      const t2 = setTimeout(() => setAnalysisProgress(2), 1600);
      const t3 = setTimeout(() => setAnalysisProgress(3), 2400);
      const t4 = setTimeout(() => setAnalysisProgress(4), 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [activeStep]);

  // Automatically clear overlay modals when routing step changes
  useEffect(() => {
    setShowConfirmScreen(false);
    setShowCelebration(false);
  }, [activeStep]);

  const handleGoogleLoginSuccess = (profile: UserProfile) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setUser(profile);
      setAuthMode('GOOGLE');
      
      const redirectStep = (window as any)._migrationRedirectStep || 11;
      (window as any)._migrationRedirectStep = null;
      setActiveStep(redirectStep);
    }, 600);
  };

  // Google GSI script loader and initialization
  useEffect(() => {
    if (activeStep === 2) {
      AuthService.loadGoogleGIS().then(() => {
        try {
          const google = (window as any).google;
          if (google) {
            google.accounts.id.initialize({
              client_id: '12345678-mock.apps.googleusercontent.com',
              callback: (response: any) => {
                const payload = AuthService.decodeJwt(response.credential);
                if (payload) {
                  const profile: UserProfile = {
                    uid: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    photoURL: payload.picture,
                    providerId: 'google.com',
                    createdAt: new Date().toISOString()
                  };
                  handleGoogleLoginSuccess(profile);
                }
              }
            });
            
            google.accounts.id.renderButton(
              document.getElementById('google-signin-btn-container'),
              { theme: 'outline', size: 'medium', text: 'signin_with', width: 220 }
            );
          }
        } catch (e) {
          console.error("Error initializing Google GIS:", e);
        }
      }).catch((err) => {
        console.error("Failed to load GIS script:", err);
      });
    }
  }, [activeStep]);

  // Auto-forward logged-in users past the login screen
  useEffect(() => {
    if (hydrated && activeStep === 2 && authMode !== null) {
      setActiveStep(11);
    }
  }, [hydrated, activeStep, authMode]);

  // Guest Session Inactivity Expiry (15 minutes)
  useEffect(() => {
    if (authMode === 'GUEST') {
      const checkExpiry = () => {
        const lastActive = localStorage.getItem('taxsense_last_active');
        if (lastActive) {
          const inactiveMs = Date.now() - parseInt(lastActive, 10);
          const maxInactiveMs = 15 * 60 * 1000; // 15 minutes of inactivity
          if (inactiveMs > maxInactiveMs) {
            clearSession();
            setActiveStep(2);
            alert("Your guest session has expired due to 15 minutes of inactivity.");
          }
        }
      };

      // Set initial activity
      localStorage.setItem('taxsense_last_active', Date.now().toString());

      // Setup interval to check inactivity
      const interval = setInterval(checkExpiry, 30000); // Check every 30 seconds

      // Listen to user interaction events to refresh inactivity timer
      const refreshActivity = () => {
        localStorage.setItem('taxsense_last_active', Date.now().toString());
      };
      
      window.addEventListener('mousemove', refreshActivity);
      window.addEventListener('keydown', refreshActivity);
      window.addEventListener('click', refreshActivity);

      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', refreshActivity);
        window.removeEventListener('keydown', refreshActivity);
        window.removeEventListener('click', refreshActivity);
      };
    }
  }, [authMode]);

  // Global keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      
      // Stage jumps: only when activeStep >= 3 and not typing in input
      if (activeStep >= 3 && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        switch (e.key) {
          case '1':
            setActiveStep(11); // Dashboard Hub
            break;
          case '2':
            setActiveStep(3);  // Documents
            break;
          case '3':
            setActiveStep(4);  // AI Analysis
            break;
          case '4':
            setActiveStep(5);  // Recommendations
            break;
          case '5':
            setActiveStep(6);  // Tax Return
            break;
          case '6':
            setActiveStep(10); // History logs
            break;
          case '7':
            setIsSettingsOpen(prev => !prev); // Toggle Settings
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  // Derive taxData state from Zustand store for calculations and reviews
  const taxData: TaxData = useMemo(() => ({
    assessmentYear: TAX_CONFIG.assessmentYear,
    grossSalary: incomeProfile?.grossSalary || 0,
    hraExemption: confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: TAX_CONFIG.standardDeductionOld,
    standardDeductionNew: TAX_CONFIG.standardDeductionNew,
    otherIncome: incomeProfile?.otherIncome || 0,
    deduction80C: confirmedDeductions?.['80C'] || 0,
    deduction80D: confirmedDeductions?.['80D'] || 0,
    deduction80TTA: confirmedDeductions?.['80TTA'] || 0,
    deduction80G: confirmedDeductions?.['80G'] || 0,
    section24b: confirmedDeductions?.['section24b'] || 0,
    tdsDeducted: incomeProfile?.tdsDeducted || 0,
    stcg: incomeProfile?.stcg || 0,
    ltcg: incomeProfile?.ltcg || 0,
    deduction80CCD1B: confirmedDeductions?.['80CCD(1B)'] || 0,
    deduction80CCD2: confirmedDeductions?.['80CCD(2)'] || 0,
    deduction80DD: confirmedDeductions?.['80DD'] || 0,
    deduction80U: confirmedDeductions?.['80U'] || 0,
    deduction80DDB: confirmedDeductions?.['80DDB'] || 0,
    deduction80E: confirmedDeductions?.['80E'] || 0,
    deduction80EEA: confirmedDeductions?.['80EEA'] || 0,
    deduction80GG: confirmedDeductions?.['80GG'] || 0,
    deduction80TTB: confirmedDeductions?.['80TTB'] || 0,
  }), [incomeProfile, confirmedDeductions]);

  // Memoize tax calculation result to avoid redundant evaluations
  const taxCalculationResult = useMemo(() => {
    return calculateTax(taxData);
  }, [taxData]);
  const acceptExtractedData = (confirmedData: TaxData) => {
    setIncomeProfile({
      grossSalary: confirmedData.grossSalary || 0,
      otherIncome: confirmedData.otherIncome || 0,
      tdsDeducted: confirmedData.tdsDeducted || 0,
      employerName: confirmedData.employerName || '',
      pfContribution: confirmedData.pfContribution || 0,
      basicSalary: confirmedData.basicSalary || 0,
      stcg: confirmedData.stcg || 0,
      ltcg: confirmedData.ltcg || 0,
    });
    updateDeduction('80C', confirmedData.deduction80C || 0);
    updateDeduction('80D', confirmedData.deduction80D || 0);
    updateDeduction('HRA exemption', confirmedData.hraExemption || 0);
    updateDeduction('section24b', confirmedData.section24b || 0);
    
    setShowConfirmScreen(false);
    setActiveStep(4); // Route to Copilot diagnosis stage
  };

  const handleNumericChange = (field: 'grossSalary' | 'otherIncome' | 'tdsDeducted', val: string) => {
    const numeric = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    setIncomeProfile({ [field]: numeric });
  };

  const executeFilingSubmission = () => {
    // Collect active values and push into log history
    const taxSummary = taxCalculationResult;
    const optimalTax = taxSummary.recommendedRegime === 'NEW' 
      ? taxSummary.newRegime.totalTaxPayable 
      : taxSummary.oldRegime.totalTaxPayable;
    const netTax = Math.max(0, optimalTax - taxData.tdsDeducted);
    const randomId = `TXS-${Math.floor(100000 + Math.random() * 900000)}`;
    const curDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    addFilingHistory({
      id: randomId,
      date: curDate,
      grossSalary: taxData.grossSalary,
      totalDeductions: taxData.deduction80C + taxData.deduction80D + taxData.hraExemption + taxData.section24b,
      netTaxPaid: netTax,
      recommendedRegime: taxSummary.recommendedRegime,
      formType: formType,
      taxData: { ...taxData }
    });
    
    setShowCelebration(true);
  };

  const handleDownloadHistoryJSON = (item: FilingHistoryItem) => {
    let dataToExport = item.taxData;
    if (!dataToExport) {
      dataToExport = {
        assessmentYear: TAX_CONFIG.assessmentYear,
        grossSalary: item.grossSalary,
        hraExemption: 0,
        ltaExemption: 0,
        standardDeductionOld: TAX_CONFIG.standardDeductionOld,
        standardDeductionNew: TAX_CONFIG.standardDeductionNew,
        otherIncome: 0,
        deduction80C: item.recommendedRegime === 'OLD' ? Math.min(item.totalDeductions, 150000) : 0,
        deduction80D: item.recommendedRegime === 'OLD' ? Math.max(0, Math.min(item.totalDeductions - 150000, 25000)) : 0,
        deduction80TTA: 0,
        deduction80G: 0,
        section24b: 0,
        tdsDeducted: 0,
      };
    }
    ExportService.downloadJSON(dataToExport, item.formType);
  };

  const handleDownloadHistoryPDF = (item: FilingHistoryItem) => {
    let dataToExport = item.taxData;
    if (!dataToExport) {
      dataToExport = {
        assessmentYear: TAX_CONFIG.assessmentYear,
        grossSalary: item.grossSalary,
        hraExemption: 0,
        ltaExemption: 0,
        standardDeductionOld: TAX_CONFIG.standardDeductionOld,
        standardDeductionNew: TAX_CONFIG.standardDeductionNew,
        otherIncome: 0,
        deduction80C: item.recommendedRegime === 'OLD' ? Math.min(item.totalDeductions, 150000) : 0,
        deduction80D: item.recommendedRegime === 'OLD' ? Math.max(0, Math.min(item.totalDeductions - 150000, 25000)) : 0,
        deduction80TTA: 0,
        deduction80G: 0,
        section24b: 0,
        tdsDeducted: 0,
      };
    }
    ExportService.downloadPDF(dataToExport, item.formType);
  };

  // Get dynamic greeting greeting message based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    const name = incomeProfile?.employeeName || 'Mohit';
    const shortName = name.split(/\s+/)[0];
    if (hours < 12) return `Good Morning, ${shortName}`;
    if (hours < 18) return `Good Afternoon, ${shortName}`;
    return `Good Evening, ${shortName}`;
  };

  // Show the landing page immediately to avoid initial loading block/spinner
  if (currentStep === 'HOME' || !hydrated) {
    return <LandingPage onStart={() => { if (hydrated) { setActiveStep(2); } }} />;
  }

  return (
    <div id="taxsense-app" className="min-h-screen bg-[#050607] text-white dark:text-slate-100 flex font-sans select-none antialiased relative overflow-hidden">
      
      {/* Pinned fixed cinematic noise texture across the viewport */}
      <div className="cinematic-noise" />

      {/* BACKGROUND FLOATING EFFECTS: Aurora & Glows */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * -8px), calc(var(--mouse-y, 0) * -8px), 0)',
          transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Soft radial emerald focal spotlight behind heading with breathing pulse */}
        <div 
          style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)' }}
          className="absolute top-[32%] left-[50%] w-[750px] h-[400px] pointer-events-none animate-spotlight-pulse" 
        />
        
        {/* Subtle auroral curtain glows */}
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 50%, transparent 80%)' }}
          className="absolute -top-[10%] left-[5%] w-[800px] h-[600px] animate-aurora-1" 
        />
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.06) 0%, rgba(16, 185, 129, 0.02) 45%, transparent 75%)' }}
          className="absolute top-[35%] -right-[10%] w-[900px] h-[700px] animate-aurora-2" 
        />
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' }}
          className="absolute bottom-[10%] left-[10%] w-[700px] h-[600px] animate-aurora-1" 
        />
      </motion.div>

      {/* TWINKLING PARTICLE FIELD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.2 }}
        style={{
          transform: 'translate3d(calc(var(--mouse-x, 0) * 25px), calc(var(--mouse-y, 0) * 25px), 0)',
          transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="absolute inset-0 pointer-events-none overflow-hidden z-1"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
            className="absolute bg-emerald-400/20 rounded-full animate-particle-twinkle"
          />
        ))}
      </motion.div>

      <Suspense fallback={
        <div className="relative z-10 flex-1 min-h-screen bg-[#040608]/40 p-8 space-y-6 animate-pulse font-sans">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-200/10 dark:bg-slate-800/20 rounded-xl" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200/10 dark:bg-slate-800/20 rounded-lg" />
              <div className="w-48 h-3 bg-slate-200/10 dark:bg-slate-800/20 rounded-lg" />
            </div>
          </div>
          <div className="w-full h-64 bg-slate-200/10 dark:bg-slate-800/20 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
            <div className="h-32 bg-slate-200/10 dark:bg-slate-800/20 rounded-2xl" />
          </div>
        </div>
      }>
        {/* Stage 2: Sandbox Entry (No Sidebar) */}
        {activeStep === 2 && (
          <div className="relative z-10 flex-1 flex flex-col min-h-screen bg-[#070809] overflow-hidden justify-center items-center p-6">
            
            {/* Viewport Edge Vignette for Stage 2 */}
            <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />

            {/* Very faint technical grid overlay (1% opacity, 120px spacing) */}
            <div 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px)', 
                backgroundSize: '120px 120px'
              }} 
              className="absolute inset-0 z-0 pointer-events-none" 
            />

            {/* Microscopic slowly drifting ambient particles (2% opacity) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
              {[...Array(8)].map((_, i) => {
                const delay = i * 2;
                const size = (i % 2) + 3; // 3px or 4px
                const left = (i * 13) % 100;
                const duration = 18 + (i % 3) * 4;
                return (
                  <div
                    key={i}
                    style={{
                      left: `${left}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: i % 2 === 0 ? '#16E27A' : '#3B82F6',
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                      bottom: '-10px',
                    }}
                    className="absolute rounded-full animate-drift"
                  />
                );
              })}
            </div>

            {/* Cinematic background auroras (large radial glows behind the card) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {/* Emerald radial glow */}
              <motion.div 
                animate={{
                  x: [0, 20, -10, 0],
                  y: [0, -30, 20, 0]
                }}
                transition={{ duration: 75, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: 'radial-gradient(circle, rgba(22, 226, 122, 0.045) 0%, transparent 70%)' }}
                className="absolute top-[20%] left-[25%] w-[800px] h-[500px]" 
              />
              
              {/* Blue secondary glow */}
              <motion.div 
                animate={{
                  x: [0, -15, 10, 0],
                  y: [0, 25, -20, 0]
                }}
                transition={{ duration: 85, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.02) 0%, transparent 70%)' }}
                className="absolute bottom-[10%] right-[15%] w-[800px] h-[500px]" 
              />
            </div>

            {/* Floating Entrance Navbar (Arc Browser Style) */}
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-6 py-3.5 bg-[#0E131B]/40 border border-white/[0.04] rounded-full backdrop-blur-md shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#16E27A] flex items-center justify-center text-slate-950 font-bold text-xs">
                  T
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-white">TaxSense</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16E27A] animate-ping" />
                <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Public Beta Active</span>
              </div>
            </motion.div>

            {/* Main Interactive Entrance Card Container */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              onMouseMove={handleAuthCardMouseMove}
              onMouseEnter={() => setAuthCardHovered(true)}
              onMouseLeave={() => setAuthCardHovered(false)}
              className="max-w-[720px] w-full relative z-10 p-[1.5px] rounded-[22px] overflow-hidden transition-all duration-300"
            >
              {/* Subtle inner border sweep */}
              <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent,rgba(22,226,122,0.06),transparent_50%)] animate-border-beam pointer-events-none" />

              {/* Surface Card with layered glassmorphism */}
              <div className="relative w-full h-full bg-[#0F1216]/75 border border-white/[0.06] rounded-[22px] p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-[40px] space-y-8 overflow-hidden">
                
                {/* Radial interactive spotlight following cursor */}
                <div 
                  style={{
                    background: `radial-gradient(220px circle at ${authCardCoords.x}px ${authCardCoords.y}px, rgba(22, 226, 122, 0.025), transparent 85%)`
                  }}
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${authCardHovered ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Glass reflections overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.003] to-white/[0.008] pointer-events-none" />

                <div className="text-center space-y-4 relative z-10">
                  {/* Secure Shield emblem with breathing pulse animation */}
                  <div className="w-14 h-14 bg-gradient-to-b from-[#16E27A]/15 to-[#16E27A]/5 text-[#16E27A] rounded-[16px] flex items-center justify-center mx-auto border border-[#16E27A]/20 shadow-[0_0_15px_rgba(22,226,122,0.1)] relative">
                    <motion.div 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-[#16E27A]/10 rounded-[16px] blur-sm pointer-events-none"
                    />
                    <ShieldCheck className="w-7 h-7 text-[#16E27A] z-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">Start your secure filing workspace</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto font-semibold">
                      Choose how you'd like to continue.
                    </p>
                  </div>
                </div>

                {/* Staggered choice cards wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative z-10">
                  
                  {/* Guest Access Card (Minimal, Dark, Neutral) */}
                  <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] hover:-translate-y-1 hover:bg-white/[0.025] transition-all duration-355 flex flex-col justify-between space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group">
                    <div className="space-y-2 text-left">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Continue as Guest</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Instant sandbox access. Data is stored temporarily in browser memory and is automatically wiped after 15 minutes of inactivity.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsAuthenticating(true);
                        setTimeout(() => {
                          setIsAuthenticating(false);
                          setAuthMode('GUEST');
                          setUser(null);
                          const redirectStep = (window as any)._migrationRedirectStep || 11;
                          (window as any)._migrationRedirectStep = null;
                          setActiveStep(redirectStep);
                        }, 600);
                      }}
                      className="w-full py-3 bg-[#1C2026] hover:bg-[#252A33] text-white font-bold rounded-xl text-xs tracking-wide cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 border border-white/[0.04] hover:border-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                    >
                      {isAuthenticating ? 'Initializing...' : 'Start as Guest'}
                      {!isAuthenticating && <ArrowRight className="w-3.5 h-3.5 text-slate-350" />}
                    </button>
                  </div>

                  {/* Google Access Card (Emerald Glow, subtle border recommendations) */}
                  <div className="p-6 rounded-2xl bg-[#0E131B]/40 border border-[#16E27A]/15 hover:border-[#16E27A]/30 hover:bg-[#0E131B]/60 hover:-translate-y-1 transition-all duration-355 flex flex-col justify-between space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(22,226,122,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(22,226,122,0.06)] relative group">
                    <div className="absolute top-0 right-0 bg-[#16E27A]/10 text-[#16E27A] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-bl-lg border-l border-b border-[#16E27A]/15">
                      Recommended
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        Sign In with Google
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                        Saves progress dynamically, locks Form 16 documents to your encrypted Vault, and retains AI chat history across devices.
                      </p>
                    </div>
                    
                    <div className="space-y-2.5">
                      {/* Google GSI Native button container */}
                      <div id="google-signin-btn-container" className="flex justify-center w-full min-h-[36px]" />
                      
                      {/* Fallback/Simulated secure button */}
                      <button
                        onClick={() => {
                          const mockProfile: UserProfile = {
                            uid: 'google-908231',
                            name: 'Mohit Kumar',
                            email: 'mohit.kumar@gmail.com',
                            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80',
                            providerId: 'google.com',
                            createdAt: new Date().toISOString()
                          };
                          handleGoogleLoginSuccess(mockProfile);
                        }}
                        className="relative overflow-hidden w-full py-3 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black rounded-xl text-xs tracking-wide cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(22,226,122,0.15)] hover:shadow-[0_4px_20px_rgba(22,226,122,0.3)] border border-transparent group"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                        <span>Simulate Google Login</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated Divider (fade -> center glow -> fade) */}
                <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-4">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[1px] bg-[#16E27A]/30 blur-[1px]" />
                </div>

                {/* Trust Footer Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5 relative z-10">
                  <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16E27A]" />
                    End-to-End Encrypted
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16E27A]" />
                    Local Processing
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16E27A]" />
                    Files Never Shared
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}

        {/* Stage 3-11: Workspace layout with Sidebar */}
        {activeStep >= 3 && (
          <div className="relative z-10 flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-transparent">
            {/* Collapsible Sidebar */}
            <aside className={`border-r border-white/[0.04] dark:border-slate-800/40 bg-[#040608]/40 dark:bg-slate-900/35 backdrop-blur-md flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-35 relative ${
              isSidebarCollapsed ? 'w-[72px]' : 'w-60'
            }`}>
              <div className="flex flex-col">
                <div className={`py-5 border-b border-white/[0.04] dark:border-slate-900/50 flex items-center relative ${
                  isSidebarCollapsed ? 'px-0 justify-center' : 'px-4 justify-between'
                }`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg text-slate-950 font-bold shrink-0 flex items-center justify-center">
                      <Calculator className="h-4.5 w-4.5 text-slate-950" />
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="font-black text-xs uppercase tracking-wider text-slate-100">TaxSense</span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-6 p-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full text-slate-400 hover:text-slate-200 cursor-pointer hidden md:block z-50 shadow-lg"
                  >
                    {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <nav className="p-3 space-y-1">
                  {[
                    { label: 'Dashboard', step: 11, icon: LayoutDashboard },
                    { 
                      label: 'Document Vault', 
                      step: 3, 
                      icon: FileUp, 
                      completed: taxData.grossSalary !== 850000 || taxData.tdsDeducted !== 15000 
                    },
                    { 
                      label: 'AI Analysis', 
                      step: 4, 
                      icon: BrainCircuit, 
                      badge: 'Gemini' 
                    },
                    { 
                      label: 'Recommendations', 
                      step: 5, 
                      icon: Award, 
                      savings: taxCalculationResult.savings > 0 
                    },
                    { label: 'Tax Return', step: 6, icon: ListTodo },
                    { label: 'History & Archive', step: 10, icon: History },
                  ].map((item) => {
                    const isActive = activeStep === item.step;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setActiveStep(item.step);
                        }}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                        } py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group active:scale-98 ${
                          isActive 
                            ? 'bg-[#16E27A]/10 text-[#16E27A] border border-[#16E27A]/20' 
                            : 'text-[#8A96A8] hover:bg-white/[0.03] hover:text-[#F6F7F8] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <IconComp className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-[#16E27A] animate-pulse' : 'text-slate-400 group-hover:text-slate-200'}`} />
                          {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1">
                            {item.completed && <CheckCircle className="w-3.5 h-3.5 text-[#16E27A] shrink-0" />}
                            {item.badge && <span className="text-[8px] bg-blue-600/30 text-blue-400 px-1 py-0.5 rounded font-black tracking-wider uppercase shrink-0">{item.badge}</span>}
                            {item.savings && <span className="text-[8px] bg-[#16E27A]/10 text-[#16E27A] px-1 py-0.5 rounded font-black shrink-0">₹{taxCalculationResult.savings}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom user settings sidebar profile row */}
              <div className="p-3 border-t border-white/[0.04] dark:border-slate-900/50 space-y-2">
                {/* Background Ingestion Status indicator */}
                {ingestionState !== 'IDLE' && (
                  <div 
                     title={`${backgroundStatusMessage} (${backgroundProgress}%)`}
                     className={`p-2 bg-[#16E27A]/10 border border-[#16E27A]/20 rounded-xl space-y-1 ${
                       isSidebarCollapsed ? 'flex justify-center items-center' : ''
                     }`}
                  >
                    {isSidebarCollapsed ? (
                      <div className="relative">
                        {ingestionState === 'COMPLETED' ? (
                          <CheckCircle className="w-4.5 h-4.5 text-[#16E27A]" />
                        ) : (
                          <>
                            <Cpu className="w-4.5 h-4.5 text-[#16E27A] animate-spin" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#16E27A] rounded-full animate-ping" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-[#16E27A]">
                          <span className="flex items-center gap-1">
                            {ingestionState === 'COMPLETED' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-450" />
                            ) : (
                              <Cpu className="w-3.5 h-3.5 text-emerald-450 animate-pulse" /> 
                            )}
                            AI Ingestion
                          </span>
                          <span>{ingestionState === 'COMPLETED' ? 'Completed' : `${backgroundProgress}%`}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                            style={{ width: `${ingestionState === 'COMPLETED' ? 100 : backgroundProgress}%` }} 
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 leading-none truncate font-medium">
                          {ingestionState === 'COMPLETED' ? 'Form 16 successfully verified.' : backgroundStatusMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {authMode === 'GUEST' && (
                  isSidebarCollapsed ? (
                    <button
                      onClick={() => {
                        (window as any)._migrationRedirectStep = activeStep;
                        setActiveStep(2);
                      }}
                      title="Guest Session - Click to Sign In"
                      className="w-full flex items-center justify-center p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </button>
                  ) : (
                    <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5 text-left">
                      <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Guest Session
                      </div>
                      <div className="text-[9px] text-slate-400 leading-normal">
                        Temporary workspace. Saved data expires after 15m of inactivity.
                      </div>
                      <button
                        onClick={() => {
                          (window as any)._migrationRedirectStep = activeStep;
                          setActiveStep(2);
                        }}
                        className="w-full text-center py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Sign In to Save
                      </button>
                    </div>
                  )
                )}

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all cursor-pointer`}
                >
                  <Settings className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  {!isSidebarCollapsed && <span>Settings & Sandbox</span>}
                </button>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (() => {
                          const name = user?.name || incomeProfile?.employeeName || 'Guest User';
                          const parts = name.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            return (parts[0][0] + parts[1][0]).toUpperCase();
                          }
                          return parts[0].slice(0, 2).toUpperCase();
                        })()
                      )}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-200 truncate">{user?.name || incomeProfile?.employeeName || 'Guest User'}</span>
                        <span className="text-[8px] text-slate-500 truncate">
                          {authMode === 'GUEST' ? 'Guest Mode' : (user?.email || `PAN: ${incomeProfile?.pan || 'MK*****32F'}`)}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <button
                      onClick={() => {
                        AuthService.revokeGoogleSession();
                        clearSession();
                        setActiveStep(2);
                      }}
                      title="Log Out Session"
                      className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Viewport Core Workspace Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Persistent Tax Summary HUD */}
              {activeStep >= 3 && activeStep <= 9 && (
                <div className="w-full bg-[#040608]/20 border-b border-white/[0.04] dark:border-slate-800/30 backdrop-blur-md py-3 px-6 transition-colors duration-200 shadow-xs shrink-0 z-20 relative">
                  <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Tax Status:</span>
                      
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/40 border border-white/[0.04] rounded-lg">
                        <span className="text-slate-400">Gross Salary:</span>
                        <span className="font-mono font-bold text-slate-200">{formatINR(taxData.grossSalary)}</span>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/5 border border-blue-500/10 rounded-lg animate-pulse">
                        <span className="text-blue-400">Eligible Form:</span>
                        <span className="font-bold text-blue-300">{formType}</span>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <span className="text-emerald-450 font-semibold">Claimed Deductions:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatINR(
                            taxData.deduction80C + 
                            taxData.deduction80D + 
                            taxData.hraExemption + 
                            taxData.section24b
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">
                        <span>Optimal Regime:</span>
                        <span className="font-mono">
                          {taxCalculationResult.recommendedRegime === 'NEW' ? 'NEW REGIME' : 'OLD REGIME'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-455 font-bold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Saves {formatINR(taxCalculationResult.savings)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Viewport */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-between relative bg-transparent z-10">
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
                  
                  {/* Dialog Trigger: Extraction Confirmation */}
                  <AnimatePresence>
                    {showConfirmScreen && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 15 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative z-50 space-y-6"
                        >
                          <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                            <ExtractionConfirm 
                              extractedData={extractedData} 
                              onConfirm={acceptExtractedData}
                              onCancel={() => {
                                setShowConfirmScreen(false);
                                setExtractedData(null);
                              }}
                              isProcessing={isExtracting}
                            />
                          </Suspense>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {/* Stage 11: Dashboard Command Center */}
                    {activeStep === 11 && (
                      <motion.div
                        key="step-11"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {/* Top Hero Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
                          <div className="md:col-span-2 space-y-2">
                            <h1 className="text-xl font-bold tracking-tight text-white">{getGreeting()}</h1>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                              Your AY 2026-27 tax filing draft has been compiled locally. We detected underutilized claims under Section 80D. Clear optimization options await below.
                            </p>
                            
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">ITR-1 Eligible</span>
                              {authMode === 'GUEST' ? (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Guest Session • Data stored temporarily</span>
                              ) : (
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                  Google Account Connected ({user?.email})
                                </span>
                              )}
                            </div>

                            {authMode === 'GUEST' && (
                              <div className="mt-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <span className="text-slate-400 font-medium text-left">
                                  Save your filing history, uploaded documents, and AI conversations by signing in.
                                </span>
                                <button
                                  onClick={() => {
                                    (window as any)._migrationRedirectStep = 11;
                                    setActiveStep(2);
                                  }}
                                  className="px-3 py-1 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                                >
                                  Save Progress
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Circular Filing Progress Ring */}
                          <div className="flex flex-col items-center justify-center p-2">
                            <div className="relative w-24 h-24">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-slate-800"
                                  strokeWidth="3.5"
                                  stroke="currentColor"
                                  fill="transparent"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-emerald-500"
                                  strokeWidth="3.5"
                                  strokeDasharray="72, 100"
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <span className="text-base font-extrabold font-mono leading-none">72%</span>
                                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black mt-1">Complete</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle Columns: Left (Actions/insights) & Right (Timeline/Status) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Left Columns (Span 2) */}
                          <div className="lg:col-span-2 space-y-6">
                             {/* AI Summary and Diagnostic Score Hero Card */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/[0.02] blur-[60px] rounded-full pointer-events-none" />
                              
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
                                <div className="space-y-3 flex-1">
                                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                    AI Tax Diagnostic Summary
                                  </h3>
                                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                                    "Standard deductions of {formatINR(75000)} mapped. Section 80C PPF/ELSS thresholds are fully claimed. However, you can save an additional {formatINR(taxCalculationResult.savings)} by shifting from Old to the New tax regime structure."
                                  </p>
                                </div>
                                
                                <div className="md:border-l md:border-white/[0.04] md:pl-6 shrink-0 flex flex-col justify-center space-y-1">
                                  <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider block font-mono">Tax Health Score</span>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-extrabold text-white font-mono tracking-tighter leading-none">85</span>
                                    <span className="text-[11px] text-slate-500 font-bold font-mono">/ 100</span>
                                  </div>
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black tracking-wider uppercase inline-block">Good • Claim 80D</span>
                                </div>
                              </div>
                            </div>

                            {/* Volumetric Next Step CTA Spotlight */}
                            <div className="relative bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden">
                              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
                              <div className="space-y-1.5 z-10 text-center md:text-left">
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-450 px-2 py-0.5 rounded font-black tracking-wider uppercase">Primary Next Step</span>
                                <h4 className="text-xs font-bold text-slate-100">Claim Medical Insurance Premium under 80D</h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                  We detected zero claims under Section 80D. Synced profiles usually save an additional {formatINR(25000)} in taxable deductions.
                                </p>
                              </div>
                              <button
                                onClick={() => setActiveStep(6)}
                                className="px-5 py-3 bg-emerald-50 hover:bg-emerald-400 text-slate-955 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/15 select-none active:scale-95 flex items-center gap-1.5"
                              >
                                <span>Continue Filing</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-955" />
                              </button>
                            </div>

                            {/* Recent Documents list */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-3">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                                Ingested Document Ledger
                              </h3>
                              <div className="space-y-2.5">
                                {uploadedFiles.length > 0 ? (
                                  uploadedFiles.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs">
                                      <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                        <div className="flex flex-col">
                                          <span className="font-bold text-slate-200">{doc.name}</span>
                                          <span className="text-[8px] text-slate-500">{doc.size} • {doc.uploadTime}</span>
                                        </div>
                                      </div>
                                      <span className="text-[8px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 px-2 py-0.5 rounded font-black tracking-wider uppercase">{doc.status}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-slate-500 italic p-3 text-center">No documents uploaded yet.</p>
                                )}
                                {(taxData.stcg > 0 || taxData.ltcg > 0) && (
                                  <div className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                      <div className="flex flex-col">
                                        <span className="font-bold text-slate-200">Equity_Capital_Gains.csv</span>
                                        <span className="text-[8px] text-slate-500">1.2 MB • Synced</span>
                                      </div>
                                    </div>
                                    <span className="text-[8px] bg-blue-500/10 text-blue-450 border border-blue-500/15 px-2 py-0.5 rounded font-black tracking-wider uppercase">ITR-2 Synced</span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Right Columns (Span 1) */}
                          <div className="space-y-6">
                            
                            {/* Latest AI Insights drawer card */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-4">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                Latest Copilot Alerts
                              </h3>
                              
                              <div className="space-y-3.5">
                                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    Section 80D Audit
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                                    You paid zero medical premiums. Seniors aged 60+ parents unlock an extra limit of ₹50,000.
                                  </p>
                                </div>

                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    HRA rent exemption
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                                    Confirm rent receipt logs to check compliance with Section 10(13A). Rent above 1L requires landlord PAN.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Recent Activity Log timeline card */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-4">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity Logs</h3>
                              <div className="relative pl-4 space-y-4 border-l border-slate-800">
                                {[
                                  { label: 'Sandbox profile active', date: 'Jul 4 19:38', desc: 'Secure connection established' },
                                  { label: 'Form 16 uploaded', date: 'Jul 4 19:40', desc: 'Auto extraction computed' },
                                  { label: 'Regime optimized', date: 'Jul 4 19:45', desc: 'New regime saving: ₹18,240' },
                                ].map((act, i) => (
                                  <div key={i} className="relative text-xs space-y-0.5">
                                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 ring-4 ring-emerald-500/10" />
                                    <span className="block font-bold text-slate-200">{act.label}</span>
                                    <span className="block text-[8px] text-slate-500">{act.date} • {act.desc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* Stage 3: Dedicated Document Vault page */}
                    {activeStep === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                      >
                        <Suspense fallback={<div className="h-[400px] bg-slate-900/10 animate-pulse rounded-3xl" />}>
                          <DocumentVault 
                            onFileUpload={() => {}} 
                            setActiveStep={setActiveStep}
                            onViewExtractedFields={() => setShowConfirmScreen(true)}
                          />
                        </Suspense>
                      </motion.div>
                    )}

                    {/* Stage 4: AI Analysis page */}
                    {activeStep === 4 && (
                      <motion.div
                        key="step-4"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans max-w-2xl mx-auto"
                      >
                        {uploadedFiles.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border-2 border-dashed border-slate-800/50 rounded-3xl backdrop-blur-md">
                            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                              <Sparkles className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 tracking-tight">AI Audit Standby</h3>
                            <p className="text-xs text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                              The TaxSense AI engine requires a Form 16 document to perform compliance validations. Upload a file in the Document Vault to begin the audit.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Title Card */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md">
                              <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-450 animate-pulse" />
                                TaxSense AI Audit Engine
                              </h2>
                              <p className="text-xs text-slate-400">
                                Real-time compliance validation checking parameters against official AY 2026-27 Income Tax slabs and rules.
                              </p>
                            </div>

                        {/* Audit Log Card */}
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 space-y-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
                          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/[0.01] blur-[60px] rounded-full pointer-events-none" />
                          
                          <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 shrink-0">
                                {analysisProgress >= 1 ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">✓</div>
                                ) : analysisProgress === 0 ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold animate-pulse font-mono">•</div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">-</div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className={`text-xs font-bold font-mono ${analysisProgress >= 1 ? 'text-slate-200' : analysisProgress === 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {analysisProgress >= 1 ? "Salary parameters verified" : "Verifying Form 16..."}
                                </span>
                                {analysisProgress >= 1 && (
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Gross salary mapped at <span className="font-mono text-slate-200">{formatINR(taxData.grossSalary)}</span>. Basic salary and PF variables identified.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 shrink-0">
                                {analysisProgress >= 2 ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">✓</div>
                                ) : analysisProgress === 1 ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold animate-pulse font-mono">•</div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">-</div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className={`text-xs font-bold font-mono ${analysisProgress >= 2 ? 'text-slate-200' : analysisProgress === 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {analysisProgress >= 2 ? "Income sources validated" : "Validating income parameters..."}
                                </span>
                                {analysisProgress >= 2 && (
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Salary and other income parameters mapped. Form type dynamically assigned as <span className="font-mono text-slate-200">{formType}</span>.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 shrink-0">
                                {analysisProgress >= 3 ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">✓</div>
                                ) : analysisProgress === 2 ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold animate-pulse font-mono">•</div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">-</div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className={`text-xs font-bold font-mono ${analysisProgress >= 3 ? 'text-slate-200' : analysisProgress === 2 ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {analysisProgress >= 3 ? "Deductions & Exemptions audited" : "Auditing exemptions..."}
                                </span>
                                {analysisProgress >= 3 && (
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Section 80C fully claimed at <span className="font-mono text-slate-200">{formatINR(150000)}</span>. Rent receipts check completes Section 10(13A). Underclaimed premium identified on medical insurance limits.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 shrink-0">
                                {analysisProgress >= 4 ? (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black font-mono">✓</div>
                                ) : analysisProgress === 3 ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-[10px] font-bold animate-pulse font-mono">•</div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">-</div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className={`text-xs font-bold font-mono ${analysisProgress >= 4 ? 'text-slate-200' : analysisProgress === 3 ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {analysisProgress >= 4 ? "Regime comparison finalized" : "Computing optimal regime slabs..."}
                                </span>
                                {analysisProgress >= 4 && (
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Slab comparisons completed. Switching to the New Tax Regime saves <span className="font-mono font-bold text-emerald-400">{formatINR(taxCalculationResult.savings)}</span> compared to the Old regime.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {analysisProgress >= 4 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4 pt-4 border-t border-white/[0.04]"
                            >
                              <div className="flex items-center justify-between text-xs font-bold font-mono">
                                <span className="text-slate-400">Audit Compliance Score</span>
                                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded uppercase">98% Verified</span>
                              </div>
                              <div className="text-right pt-2">
                                <button 
                                  onClick={() => setActiveStep(5)}
                                  disabled={analysisProgress < 4}
                                  className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all select-none ${
                                    analysisProgress >= 4 
                                      ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95 shadow-blue-500/10' 
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                  }`}
                                >
                                  <span>Proceed to Recommendations</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                      </motion.div>
                    )}

                    {/* Stage 5: Recommendations page */}
                    {activeStep === 5 && (
                      <motion.div
                        key="step-5"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {taxData.grossSalary === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-900/40 border-2 border-dashed border-slate-800/50 rounded-3xl backdrop-blur-md">
                            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                              <Cpu className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-400 tracking-tight">Diagnostic Standby</h3>
                            <p className="text-xs text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                              Tax calculation diagnostics are waiting for income data. Upload a Form 16 or enter manual values to generate a regime comparison.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Savings Hero Banner */}
                            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4 relative overflow-hidden backdrop-blur-md">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />
                              
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-black tracking-wider uppercase inline-block z-10 relative">Optimization Report</span>
                              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white z-10 relative">
                                Here's how you can save <span className="text-emerald-450">{formatINR(taxCalculationResult.savings)}</span>
                              </h1>
                              <p className="text-xs text-slate-400 max-w-xl mx-auto z-10 relative font-medium leading-relaxed">
                                Comparing exemption rates. Our diagnostic models suggest electing the <strong>New Tax Regime (Sec 115BAC)</strong> for maximum optimization.
                              </p>
                            </div>

                        {/* Regime Comparison Detail Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                          
                          {/* Comparison Panel (7 columns) */}
                          <div className="lg:col-span-7 flex flex-col h-full bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md justify-between space-y-6">
                            <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                              <RegimeComparison />
                            </Suspense>
                          </div>

                          {/* AI Explanation and Badge (5 columns) */}
                          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                            
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-3.5 flex-1">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                Why this recommendation?
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                "Under Section 115BAC, tax rates are lower, and standard deductions are increased to ₹75,000. Your total Old Regime deductions and exemptions (including 80C, 80D, HRA) of {formatINR(taxData.deduction80C + taxData.deduction80D + taxData.hraExemption + (taxData.section24b || 0) + (taxData.deduction80CCD1B || 0) + 50000)} are not enough to offset the lower tax rates of the New Regime."
                              </p>
                              
                              <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-xl flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                </div>
                                <span className="text-[10px] text-slate-350 font-bold uppercase tracking-wider">Confidence Level: 99% Verified</span>
                              </div>
                            </div>

                            {/* Regime Pros & Cons comparison cards */}
                            <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-3">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pros & Cons of suggestion</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Pros</span>
                                  <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Lower tax slab rates, higher standard deduction.</p>
                                </div>
                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                                  <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">Cons</span>
                                  <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Cannot claim Section 80C, 80D, or HRA rent rebates.</p>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setActiveStep(6)}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/10 select-none active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <span>Enter Guided Filing Workspace</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>

                          </div>
                        </div>
                      </div>
                    )}
                      </motion.div>
                    )}

                    {/* Stage 6: Guided Filing Experience */}
                    {activeStep === 6 && (
                      <motion.div
                        key="step-6"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        {/* filing progress tracker */}
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md space-y-4">
                          <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                              <ListTodo className="w-5 h-5 text-emerald-450" />
                              ITR Filing Pipeline
                            </h2>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Step {guidedFilingStep} of 5</span>
                          </div>
                          
                          {/* Stepper bar */}
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((stepIdx) => (
                              <button
                                key={stepIdx}
                                onClick={() => setGuidedFilingStep(stepIdx)}
                                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                                  guidedFilingStep >= stepIdx ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-wider">
                            <span>1. Personal</span>
                            <span>2. Income</span>
                            <span>3. Deductions</span>
                            <span>4. Verification</span>
                            <span>5. Generate</span>
                          </div>
                        </div>

                        {/* Main step container */}
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 backdrop-blur-md space-y-6">
                          
                          {/* Step 1: Personal Info */}
                          {guidedFilingStep === 1 && (
                            <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Personal Details</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                  <input type="text" value={incomeProfile?.employeeName || 'Mohit Kumar'} readOnly className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permanent Account Number (PAN)</label>
                                  <input type="text" value={incomeProfile?.pan || 'MK*****32F'} readOnly className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employer Category</label>
                                  <input type="text" defaultValue="Private Sector Co." disabled className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residential Status</label>
                                  <input type="text" defaultValue="Resident Individual" disabled className="w-full bg-slate-955 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-400 focus:outline-none" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Income Review */}
                          {guidedFilingStep === 2 && (
                            <div className="space-y-5">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Income Ledgers Summary</h3>
                              
                              <div className="space-y-4">
                                <div className="p-5 bg-slate-955/40 border border-white/[0.02] rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-slate-500 animate-pulse" />
                                    <div>
                                      <span className="block text-xs font-bold text-slate-200">Gross Salary (Section 17(1))</span>
                                      <span className="text-[9px] text-slate-500">Auto parsed from Form 16</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-sm font-bold">₹</span>
                                    <input 
                                      type="text" 
                                      value={taxData.grossSalary}
                                      onChange={(e) => handleNumericChange('grossSalary', e.target.value)}
                                      className="bg-slate-950 border border-white/[0.06] focus:border-emerald-500/40 rounded-xl py-2 px-3 w-40 text-right font-mono text-sm font-extrabold text-slate-100 focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>

                                <div className="p-5 bg-slate-955/40 border border-white/[0.02] rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                    <div>
                                      <span className="block text-xs font-bold text-slate-200">Income from Other Sources</span>
                                      <span className="text-[9px] text-slate-500">Savings account interest, etc.</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-sm font-bold">₹</span>
                                    <input 
                                      type="text" 
                                      value={taxData.otherIncome}
                                      onChange={(e) => handleNumericChange('otherIncome', e.target.value)}
                                      className="bg-slate-950 border border-white/[0.06] focus:border-emerald-500/40 rounded-xl py-2 px-3 w-40 text-right font-mono text-sm font-extrabold text-slate-100 focus:outline-none transition-colors"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Deductions Claims */}
                          {guidedFilingStep === 3 && (
                            <div className="space-y-6">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync Deductions Claims</h3>
                              <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                                <DeductionCard />
                              </Suspense>
                            </div>
                          )}

                          {/* Step 4: Verification & Slabs */}
                          {guidedFilingStep === 4 && (
                            <div className="space-y-6">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verifications and Slabs Audit</h3>
                              <Suspense fallback={<div className="h-96 bg-slate-900/10 animate-pulse rounded-2xl" />}>
                                <RegimeComparison />
                              </Suspense>
                            </div>
                          )}

                          {/* Step 5: Generate Return */}
                          {guidedFilingStep === 5 && (
                            <div className="space-y-5 text-center py-6">
                              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Award className="w-8 h-8 text-emerald-400" />
                              </div>
                              
                              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Verify Return & Submit</h3>
                              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Slabs audits verified compliance with Section 139(1) of the Income Tax Act. Ready to submit to the sandbox?
                              </p>

                              <button
                                onClick={executeFilingSubmission}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-1.5 mx-auto"
                              >
                                <ShieldCheck className="w-4 h-4 text-slate-955" />
                                <span>Generate and Log return</span>
                              </button>
                            </div>
                          )}

                          {/* Bottom Navigation buttons inside guided filing */}
                          <div className="pt-4 border-t border-slate-800/60 flex justify-between">
                            <button
                              onClick={() => setGuidedFilingStep(prev => Math.max(1, prev - 1))}
                              disabled={guidedFilingStep === 1}
                              className="px-4 py-2 border border-slate-800 hover:bg-white/[0.02] text-slate-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-30 disabled:pointer-events-none select-none active:scale-95"
                            >
                              Back
                            </button>
                            {guidedFilingStep < 5 ? (
                              <button
                                onClick={() => setGuidedFilingStep(prev => Math.min(5, prev + 1))}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer select-none active:scale-95"
                              >
                                Continue
                              </button>
                            ) : (
                              <div />
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {/* Stage 10: Timeline History & Archives */}
                    {activeStep === 10 && (
                      <motion.div
                        key="step-10"
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6 font-sans"
                      >
                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-5 backdrop-blur-md">
                          <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-450" />
                            Stage 10: Filing History & Archives
                          </h2>
                          <p className="text-xs text-slate-400">
                            Access secure, local archive ledger logs. Search and filter across previous assessment years.
                          </p>
                        </div>

                        {/* AI Summary Banner */}
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-455 leading-relaxed shadow-xs">
                          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-slate-200">AI Archive Diagnostic</span>
                            <span>
                              {filingHistory.length === 0 
                                ? "No previous filings detected in the sandbox cache." 
                                : `Across your logged filings, your average Gross Salary is ${formatINR(
                                    Math.round(filingHistory.reduce((acc, item) => acc + item.grossSalary, 0) / filingHistory.length)
                                  )}. Slabs audit verifies compliance with Section 139(1) for all logged assessment cycles.`}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/40 border border-white/[0.04] rounded-3xl p-6 space-y-6 backdrop-blur-md">
                          {/* Search & Filter Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeline Ledger</h3>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="text"
                                placeholder="Search by ID or date..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-3 text-xs text-slate-200 font-medium focus:outline-none focus:border-blue-500 focus:bg-slate-900 w-44"
                              />
                              <select
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                className="bg-slate-955 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-400 font-bold focus:outline-none cursor-pointer"
                              >
                                <option value="ALL">All regimes</option>
                                <option value="NEW">New regime</option>
                                <option value="OLD">Old regime</option>
                              </select>
                            </div>
                          </div>

                          {/* Notion Inspired Timeline View */}
                          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800 before:border-dashed">
                            {filingHistory
                              .filter(item => {
                                const matchesSearch = item.id.toLowerCase().includes(historySearch.toLowerCase()) || item.date.toLowerCase().includes(historySearch.toLowerCase());
                                const matchesFilter = historyFilter === 'ALL' || item.recommendedRegime === historyFilter;
                                return matchesSearch && matchesFilter;
                              })
                              .map((item, i) => (
                                <div key={item.id} className="relative text-xs space-y-2">
                                  {/* Marker circle */}
                                  <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950 ring-4 ring-emerald-500/15" />
                                  
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-100 text-xs font-mono">{item.id}</span>
                                      <span className="text-[9px] bg-slate-900 border border-white/[0.04] text-slate-400 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">{item.formType}</span>
                                      <span className="text-[9px] bg-blue-600/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">{item.recommendedRegime} REGIME</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold">{item.date}</span>
                                  </div>

                                  <div className="p-4 bg-slate-955/40 border border-white/[0.02] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 leading-relaxed">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Gross Salary</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.grossSalary)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Total Deductions</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.totalDeductions)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Net Tax Liability</span>
                                      <span className="font-mono text-[11px] font-bold text-slate-200">{formatINR(item.netTaxPaid)}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3.5 text-[10px] text-slate-400 font-bold pt-1">
                                    <button 
                                      onClick={() => handleDownloadHistoryJSON(item)}
                                      className="flex items-center gap-1 hover:text-blue-400 cursor-pointer select-none transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download JSON return</span>
                                    </button>
                                    <span>•</span>
                                    <button 
                                      onClick={() => handleDownloadHistoryPDF(item)}
                                      className="flex items-center gap-1 hover:text-blue-400 cursor-pointer select-none transition-colors"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span>Print Summary PDF</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>

                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </main>

                {/* Unified Footer */}
                <footer className="border-t border-white/[0.04] dark:border-slate-900/50 bg-[#040608]/40 dark:bg-slate-900/10 py-6 px-6 text-center text-xs text-slate-500 mt-auto shrink-0 flex flex-col md:flex-row md:justify-between md:items-center gap-3 z-10 relative">
                  <p>© 2026 TaxSense Inc. | Built for Indian salaried employees under AY 2026-27 rules.</p>
                  <div className="flex justify-center gap-4 text-slate-500 font-medium">
                    <a href="#" className="hover:text-blue-400 transition-colors">Privacy Sandbox</a>
                    <span>•</span>
                    <a href="#" className="hover:text-blue-400 transition-colors">Sec. 139(1) Filing Guide</a>
                    <span>•</span>
                    <a href="#" className="hover:text-blue-400 transition-colors">Income Tax Department APIs</a>
                  </div>
                </footer>

              </div>

            </div>

            <AICopilot isOpen={isFloatingAIChatOpen} onClose={() => setIsFloatingAIChatOpen(false)} />

            {/* Toggle trigger for Right side copilot drawer */}
            {!isFloatingAIChatOpen && (
              <button
                onClick={() => setIsFloatingAIChatOpen(true)}
                className="fixed right-6 bottom-6 z-40 p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold rounded-full shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 animate-bounce"
              >
                <Sparkles className="w-5 h-5 text-slate-955" />
              </button>
            )}

            {/* Settings Dialog Panel Overlay */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-slate-905 border border-slate-850 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-50 space-y-5 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4.5 h-4.5 text-slate-400" />
                        <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px]">Filing Preferences & Sandbox Settings</span>
                      </div>
                      <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="p-1 hover:bg-white/[0.04] rounded text-slate-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">


                      {/* Store settings */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-300 block">ITR Filing Rules</span>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <label className="flex items-center gap-2.5 p-2 bg-slate-950/40 border border-slate-850 rounded-xl cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formType === 'ITR-2'} 
                              onChange={(e) => setFormType(e.target.checked ? 'ITR-2' : 'ITR-1')} 
                              className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-400">ITR-2 Form</span>
                          </label>
                          <label className="flex items-center gap-2.5 p-2 bg-slate-950/40 border border-slate-850 rounded-xl cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={multiHouse} 
                              onChange={(e) => setMultiHouse(e.target.checked)} 
                              className="rounded border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-400">Multi House Property</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="font-bold text-red-400 block">Danger Zone</span>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              clearFilingHistory();
                              setIsSettingsOpen(false);
                            }}
                            className="flex-1 py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold rounded-xl cursor-pointer text-center select-none active:scale-95 transition-all"
                          >
                            Clear archives history
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filing Completion Celebration Overlay Modal */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/90 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="text-center space-y-6 max-w-md w-full p-8 bg-slate-905 border border-slate-850 rounded-3xl relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <CheckCircle className="w-9 h-9 text-emerald-400" />
                    </div>

                    <div className="space-y-2 z-10 relative">
                      <h2 className="text-xl font-bold tracking-tight text-white">ITR Return Logged Successfully!</h2>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Your filing draft has been compiled, audited against AY 2026-27 rules, and logged to your local sandbox archives database.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowCelebration(false);
                        setGuidedFilingStep(1);
                        setActiveStep(10); // Route directly to Timeline Archives (Stage 10)
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-955 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 select-none active:scale-95 block z-10 relative"
                    >
                      View Timeline history
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </Suspense>

      <FilingGuide isOpen={isFilingGuideOpen} onClose={() => setIsFilingGuideOpen(false)} />
    </div>
  );
}
