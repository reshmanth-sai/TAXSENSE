import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useScroll, useSpring, motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Shield, 
  Eye, 
  Cpu, 
  ArrowUpRight, 
  ChevronDown, 
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Dynamic values for Dashboard Mockup animation
  const [mockSavings, setMockSavings] = useState(0);
  const [mockRegime, setMockRegime] = useState('OLD');
  const [mockProgress, setMockProgress] = useState(45);
  const [mockBadge, setMockBadge] = useState('Sandbox Active');

  // Scroll Progress Bar Tracker
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Web Audio UI click synthesizer
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  };

  // Animate financial numbers dynamically in Mockup on Mount
  useEffect(() => {
    const t1 = setTimeout(() => {
      let currentVal = 0;
      const interval = setInterval(() => {
        currentVal += 912;
        if (currentVal >= 18240) {
          clearInterval(interval);
          setMockSavings(18240);
        } else {
          setMockSavings(currentVal);
        }
      }, 25);
      setMockRegime('NEW');
      setMockBadge('Optimal Found');
    }, 1200);

    const t2 = setTimeout(() => {
      setMockProgress(72);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleStartWorkspace = () => {
    playClickSound();
    onStart();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // Trigger small test click to confirm activation
    if (!soundEnabled) {
      setTimeout(() => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          }
        } catch (e) {}
      }, 50);
    }
  };

  const faqs = [
    {
      q: "Is my financial data safe with TaxSense?",
      a: "Yes. TaxSense uses local-first processing. If you use Guest Mode, your uploaded Form 16 documents are parsed in memory, encrypted locally, and are never saved on any database. For authenticated users, data is encrypted end-to-end and stored in your private secure vault."
    },
    {
      q: "Do I need to sign up to use the tool?",
      a: "No. You can click 'Start Guest Session' and experience the complete Form 16 extraction, regime optimization comparison, and AI chat assistant instantly without providing a name or email."
    },
    {
      q: "How accurate is the AI tax parser?",
      a: "Extremely accurate. Powered by the latest Gemini model context engines, it extracts all standard structural fields (Salary under Section 17(1), standard deductions, Chapter VI-A deductions, and TDS under Section 192) and cross-verifies sums mathematically."
    },
    {
      q: "Can I download my finalized ITR details?",
      a: "Yes. You can export a beautifully formatted PDF return guide or a clean raw JSON payload of the extracted tax parameters at any stage of the workflow."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050607] text-[#F6F7F8] font-sans antialiased selection:bg-[#16E27A] selection:text-[#050607] overflow-x-hidden relative">
      
      {/* 2px Premium Scroll Progress Indicator */}
      <motion.div 
        style={{ scaleX }} 
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#16E27A] origin-left z-[100] pointer-events-none" 
      />

      {/* 2% Opacity Film Grain Overlay */}
      <div className="cinematic-noise pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-overlay" />

      {/* 30-Second Infinite Dynamic Aurora Glows */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 0.8, 0.5, 0.6] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <motion.div 
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(circle, rgba(22, 226, 122, 0.06) 0%, transparent 70%)' }}
          className="absolute top-[25%] left-[45%] w-[850px] h-[450px]" 
        />
        
        <motion.div 
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -60, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(22, 226, 122, 0.03) 0%, rgba(5, 150, 105, 0.01) 50%, transparent 80%)' }}
          className="absolute -top-[12%] left-[8%] w-[900px] h-[650px]" 
        />
        <motion.div 
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.04) 0%, rgba(22, 226, 122, 0.01) 45%, transparent 75%)' }}
          className="absolute top-[40%] -right-[15%] w-[950px] h-[750px]" 
        />
      </motion.div>

      {/* HEADER NAVBAR (Staged Cinematic Entrance) */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between border-b bg-[#050607]/40 border-white/[0.04] backdrop-blur-md transition-all duration-300"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16E27A] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#16E27A]/15">
            <svg className="w-4.5 h-4.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
          </div>
          <span className="text-sm font-black tracking-wider uppercase text-white select-none">
            Tax<span className="text-[#16E27A]">Sense</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Subtle audio feedback switch */}
          <button 
            onClick={toggleSound}
            title={soundEnabled ? "Mute interface sounds" : "Enable interface sounds"}
            className="p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleStartWorkspace}
            className="px-4 py-1.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs rounded-full transition-all cursor-pointer shadow-md shadow-[#16E27A]/10 active:scale-95 border border-transparent"
          >
            Get started
          </button>
        </div>
      </motion.header>

      {/* SECTION 1: HERO (Fade + Scale Reveal) */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-28 max-w-5xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] text-[10px] font-bold tracking-wider uppercase"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Driven Filing for AY 2026-27</span>
          </motion.div>

          {/* Progressive Keynote Headline Slide-Up */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
            <div className="overflow-hidden inline-block py-1">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                File your taxes
              </motion.span>
            </div>
            <br />
            <div className="overflow-hidden inline-block py-1">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#16E27A] via-[#5BEAA5] to-blue-400"
              >
                with absolute confidence.
              </motion.span>
            </div>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm sm:text-base text-[#8A96A8] max-w-xl mx-auto leading-relaxed"
          >
            Upload your Form 16 PDF. Our secure AI parses your profile, checks for claims you missed, and generates a verified tax return guide in minutes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* Tactical sweep button */}
            <button
              onClick={handleStartWorkspace}
              className="relative overflow-hidden w-full sm:w-auto px-7 py-3.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#16E27A]/15 active:scale-97 flex items-center justify-center gap-2 group"
            >
              {/* Subtle hover sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Start Sandbox Workspace</span>
              <ArrowRight className="w-4 h-4 text-[#050607]" />
            </button>
            <a
              href="#interactive-showcase"
              onClick={playClickSound}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-white/[0.05] hover:border-white/[0.1] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>See Demo Mockup</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </motion.div>
        </motion.div>

        {/* HERO MOCKUP (Scroll-linked 3D perspective and scale) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full max-w-4xl border border-white/[0.05] bg-[#0E131B]/80 backdrop-blur-md rounded-3xl p-3 md:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.65)] relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#16E27A]/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="w-full bg-[#050607] border border-white/[0.05] rounded-2xl overflow-hidden aspect-[16/9] flex flex-col">
            {/* Window control header */}
            <div className="h-8 border-b border-white/[0.04] bg-[#050607] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 tracking-wider">taxsense.in/sandbox</span>
              <span className="w-10" />
            </div>
            
            {/* Mock Layout Canvas */}
            <div className="flex-1 p-4 grid grid-cols-3 gap-4 text-left text-xs bg-gradient-to-b from-[#0E131B]/40 to-[#050607]">
              <div className="col-span-2 space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#16E27A] uppercase tracking-widest">ITR Ingestion Engine</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#16E27A]/10 text-[#16E27A] border border-[#16E27A]/20 transition-all font-bold">
                      {mockBadge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">Form 16 parsed successfully</h4>
                  <p className="text-[10px] text-slate-400">
                    Gross Salary of ₹8,50,000, Section 80C deductions of ₹1,50,000, and TDS of ₹15,000 verified.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Old Regime Tax</span>
                    <span className="font-mono text-slate-350 font-bold">₹54,600</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-[#16E27A]/15 rounded-xl text-center relative overflow-hidden">
                    <span className="text-[9px] text-[#16E27A] font-bold uppercase tracking-wider block mb-1">New Regime Tax</span>
                    <span className="font-mono text-[#16E27A] font-bold">₹36,360</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">AI Optimizer</span>
                  <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] text-blue-300">
                    Claim under 80D is underutilized. Adding ₹10,000 saves ₹1,500.
                  </div>
                </div>
                
                {/* Dynamically Counter Animate value */}
                <div className="space-y-2">
                  <div className="p-2 border border-white/[0.04] rounded-lg flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Savings:</span>
                    <span className="font-mono text-[#16E27A] font-bold">
                      ₹{mockSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 bg-[#16E27A]/10 border border-[#16E27A]/25 rounded-lg text-center text-[10px] text-[#16E27A] font-black">
                    Recommended: {mockRegime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: TRUST STRIP (Subtle fade-in) */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        className="border-y border-white/[0.04] bg-[#0E131B]/30 py-8 px-6 md:px-12"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center space-y-1.5">
            <Lock className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Bank-level Encryption</span>
            <span className="text-[9px] text-slate-505">AES-256 local keys</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Cpu className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Secure AI Processing</span>
            <span className="text-[9px] text-slate-505">Private API calls</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Database className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Local-first Sandbox</span>
            <span className="text-[9px] text-slate-505">Runs in client memory</span>
          </div>
          <div className="flex flex-col items-center space-y-1.5">
            <Eye className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Privacy First</span>
            <span className="text-[9px] text-slate-505">No telemetry log sync</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center space-y-1.5">
            <Globe className="w-4 h-4 text-[#16E27A] mb-1" />
            <span className="text-[11px] font-bold text-slate-100">Built for India</span>
            <span className="text-[9px] text-slate-505">Income Tax Act ready</span>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: HOW IT WORKS (Slide Up Reveal with Filled Line Timeline) */}
      <section className="py-36 px-6 max-w-6xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Simplifying Taxes</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">The 4-Step Journey</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            We broke down tax complexity into a structured, elegant process that you control entirely.
          </p>
        </motion.div>

        {/* Connected Step Timeline */}
        <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-8">
          
          {/* Animated Connecting Timeline line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.1 }}
            className="absolute top-10 left-[12%] right-[12%] h-[1.5px] bg-[#16E27A]/25 origin-left hidden sm:block z-0"
          />

          {[
            {
              step: "01",
              title: "Upload Document",
              desc: "Drag and drop your Form 16 PDF securely. Everything processes inside a transient local memory workspace."
            },
            {
              step: "02",
              title: "AI Extraction",
              desc: "Gemini automatically reads and verifies salary components, standard deductions, and tax computed numbers."
            },
            {
              step: "03",
              title: "Recommendations",
              desc: "Compare old vs new tax regime liability. Adjust values using interactive sliders to claim missed exemptions."
            },
            {
              step: "04",
              title: "File Return",
              desc: "Check and audit final figures. Download your customized filing report and submit with single-tap accuracy."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 bg-[#0E131B] border border-white/[0.04] hover:border-[#16E27A]/25 rounded-2xl space-y-4 text-left relative transition-all duration-350 z-10"
            >
              {/* Timeline dot decoration */}
              <div className="absolute -top-3.5 left-6 w-3 h-3 rounded-full bg-[#050607] border border-[#16E27A]/50 flex items-center justify-center hidden sm:flex">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.25 + 0.3 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#16E27A]" 
                />
              </div>

              <span className="text-2xl font-black font-mono text-[#16E27A]/20 block">{item.step}</span>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-[11px] text-[#8A96A8] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE PRODUCT SHOWCASE (Slide Left Reveal) */}
      <section id="interactive-showcase" className="py-36 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Product Interface</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Interactive Showcase</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Hover over cards below to preview critical components of the TaxSense dashboard interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: AI Ingestion */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 bg-[#0E131B] border border-white/[0.04] hover:border-[#16E27A]/20 transition-all duration-350 rounded-3xl space-y-6 text-left group"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-wider block">Component 01</span>
                <h3 className="text-base font-bold text-white">AI Extraction Details</h3>
                <p className="text-[11px] text-slate-400">
                  Real-time parsed metadata displaying primary employer details, ITR-1 suitability metrics, and base salary.
                </p>
              </div>
              <div className="p-4 bg-[#050607] rounded-2xl border border-white/[0.04] space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                  <span className="text-slate-500">Employer:</span>
                  <span className="text-slate-300 truncate max-w-[120px]">Google India Pvt Ltd</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                  <span className="text-slate-500">PAN:</span>
                  <span className="text-slate-300">MK*****32F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TDS Section 192:</span>
                  <span className="text-[#16E27A]">₹15,000</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Regime Comparison */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 bg-[#0E131B] border border-white/[0.04] hover:border-[#16E27A]/20 transition-all duration-350 rounded-3xl space-y-6 text-left group"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-wider block">Component 02</span>
                <h3 className="text-base font-bold text-white">Regime Comparison</h3>
                <p className="text-[11px] text-slate-400">
                  Dynamically evaluates the optimal path, showing saving projections between New and Old regimes.
                </p>
              </div>
              <div className="p-4 bg-[#050607] rounded-2xl border border-white/[0.04] space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Tax Under Old:</span>
                  <span className="font-mono text-slate-300">₹54,600</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Tax Under New:</span>
                  <span className="font-mono text-[#16E27A]">₹36,360</span>
                </div>
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-bold">
                  <span className="text-white">Net Savings:</span>
                  <span className="text-[#16E27A] font-mono">₹18,240</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Tax Health Score */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 bg-[#0E131B] border border-white/[0.04] hover:border-[#16E27A]/20 transition-all duration-350 rounded-3xl space-y-6 text-left group"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-wider block">Component 03</span>
                <h3 className="text-base font-bold text-white">Smart Optimization</h3>
                <p className="text-[11px] text-slate-400">
                  Circular optimization percentage mapping standard allowances (80C, 80D, HRA) to underutilized opportunities.
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#050607] rounded-2xl border border-white/[0.04]">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                    <motion.circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#16E27A" 
                      strokeWidth="3.5" 
                      initial={{ strokeDasharray: "0, 100" }}
                      whileInView={{ strokeDasharray: "72, 100" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                    72%
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <span className="font-bold text-white block">Claimed Deductions</span>
                  <span>₹1,50,000 of ₹2,00,000 claimed.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY TAXSENSE (Slide Right Reveal) */}
      <section className="py-36 px-6 max-w-5xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Filing Comparison</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Standard vs TaxSense</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            Traditional filing is tedious, confusing, and error-prone. TaxSense makes it simple, transparent, and fast.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Traditional Filing */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 0.7, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] space-y-6 text-left"
          >
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Traditional Filing
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Hours of manual paperwork</span>
                <span className="text-[11px] text-slate-500">Cross-referencing spreadsheets and form sections manually.</span>
              </div>
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Complex calculations</span>
                <span className="text-[11px] text-slate-500">Manual computations for HRA exemption limits and Section 80C.</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-200 font-semibold block text-xs">Opaque regimes</span>
                <span className="text-[11px] text-slate-500">Selecting tax regimes blindly without seeing computed differences.</span>
              </div>
            </div>
          </motion.div>

          {/* Column 2: TaxSense */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="p-8 rounded-3xl bg-[#0E131B] border border-[#16E27A]/10 space-y-6 text-left shadow-lg shadow-[#16E27A]/3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-[#16E27A]/10 text-[#16E27A] px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-bl-xl border-l border-b border-[#16E27A]/20">
              Modern
            </div>
            
            <h3 className="text-base font-bold text-[#16E27A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16E27A]" />
              Filing with TaxSense
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-white font-bold block text-xs">Minutes with Secure AI</span>
                <span className="text-[11px] text-slate-400">PDF upload instantly initializes your draft worksheet.</span>
              </div>
              <div className="border-b border-white/[0.04] pb-3 space-y-1">
                <span className="text-white font-bold block text-xs">AI Verified Calculations</span>
                <span className="text-[11px] text-slate-400">Mathematical validation ensures perfect accuracy.</span>
              </div>
              <div className="space-y-1">
                <span className="text-white font-bold block text-xs">Guided Regime Optimizations</span>
                <span className="text-[11px] text-slate-400">Simulate regime differences dynamically to pay the lowest tax.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6: AI COPILOT SHOWCASE (Scale + Fade Reveal) */}
      <section className="py-36 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Conversational Assistant</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">AI Copilot Showcase</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Ask tax-related questions to the copilot and get mathematically backed optimizations.
            </p>
          </motion.div>

          <div className="p-6 bg-[#0E131B] border border-white/[0.05] rounded-3xl space-y-6 text-left max-w-xl mx-auto">
            {/* User Turn */}
            <div className="flex gap-3 items-start flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                U
              </div>
              <div className="flex flex-col items-end max-w-[85%]">
                <div className="px-4 py-2.5 rounded-2xl bg-blue-600/90 text-white rounded-tr-none text-xs">
                  How much tax do I save under the New Regime?
                </div>
              </div>
            </div>

            {/* AI Turn */}
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] text-[10px] font-bold flex items-center justify-center shrink-0">
                AI
              </div>
              <div className="flex flex-col items-start max-w-[85%] space-y-2">
                <div className="px-4 py-2.5 rounded-2xl bg-[#050607] border border-white/[0.06] text-slate-300 rounded-tl-none text-xs leading-relaxed">
                  You save **₹18,240** by filing under the New Regime. This is because under the New Regime, standard deductions of ₹75,000 apply automatically, and your ₹8,50,000 gross salary is taxed under lower rate bands, resulting in a liability of ₹36,360 compared to ₹54,600 under the Old Regime.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-[#16E27A]/10 text-[#16E27A] border border-[#16E27A]/20 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                    Confidence: 99.8%
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold">Verified against FY 2025-26 rules</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SECURITY (Opacity Reveal) */}
      <section className="py-36 px-6 max-w-5xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Privacy & Security</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Security Highlights</h2>
          <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
            Your financial data is private. We implement rigorous security parameters to ensure your data stays yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="p-6 bg-[#0E131B] border border-white/[0.04] rounded-2xl space-y-3 text-left"
          >
            <Shield className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Encrypted Documents</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              All uploaded Form 16 documents are encrypted client-side using industry-standard AES-256 local keys.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 bg-[#0E131B] border border-white/[0.04] rounded-2xl space-y-3 text-left"
          >
            <Eye className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Private Local Processing</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Your session is parsed locally in-memory, making guest workspaces entirely transient and secure.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="p-6 bg-[#0E131B] border border-white/[0.04] rounded-2xl space-y-3 text-left"
          >
            <Lock className="w-5 h-5 text-[#16E27A]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sandbox Isolation</h3>
            <p className="text-[11px] text-slate-455 leading-relaxed">
              Calculations run in an isolated client sandbox environment preventing unauthorized network telemetry leaks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS (Staggered Cards Reveal) */}
      <section className="py-36 border-y border-white/[0.04] bg-[#0E131B]/10 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">User Stories</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Loved by Taxpayers</h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] max-w-md mx-auto">
              Read how Indian salaried professionals file their returns confidently with TaxSense.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                text: "\"Uploading my Form 16 took less than 10 seconds. The AI parsed everything perfectly and recommended the New Regime, saving me ₹18,240.\"",
                initials: "MK",
                name: "Mohit Kumar",
                role: "Software Engineer, Bangalore"
              },
              {
                text: "\"TaxSense sandbox mode let me compare regimes and claims safely without registering first. Frictionless, fast, and secure.\"",
                initials: "AS",
                name: "Anjali Sharma",
                role: "Product Manager, Mumbai"
              },
              {
                text: "\"The AI Copilot answered my specific questions about Section 80D with confidence and backed the calculations with actual math. Unbelievably good.\"",
                initials: "RV",
                name: "Rohan Verma",
                role: "UX Researcher, Delhi"
              }
            ].map((test, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 bg-[#0E131B] border border-white/[0.04] rounded-2xl space-y-4 text-left flex flex-col justify-between"
              >
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  {test.text}
                </p>
                <div className="flex items-center gap-2.5 pt-2 border-t border-white/[0.04]">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-[9px] font-bold flex items-center justify-center">
                    {test.initials}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-white block leading-none">{test.name}</span>
                    <span className="text-[8px] text-slate-500">{test.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ (Soft Fade Reveal with disclosure heights) */}
      <section className="py-36 px-6 max-w-3xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          <span className="text-[10px] text-[#16E27A] font-bold uppercase tracking-widest">Common Questions</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Frequently Asked FAQ</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="border-b border-white/[0.04] pb-4 text-left"
            >
              <button
                onClick={() => {
                  playClickSound();
                  setFaqOpen(faqOpen === index ? null : index);
                }}
                className="w-full flex items-center justify-between text-slate-100 hover:text-white font-bold text-xs uppercase tracking-wider py-2 cursor-pointer transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${faqOpen === index ? 'rotate-180 text-[#16E27A]' : ''}`} />
              </button>
              
              <AnimatePresence>
                {faqOpen === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
                    exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden mt-1 text-[11px] text-[#8A96A8] leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 10: FINAL CTA (Inc. Ambient light focus rise) */}
      <section className="relative py-44 px-6 border-t border-white/[0.04] text-center overflow-hidden">
        
        {/* Ambient lighting focused rise when in view */}
        <motion.div 
          initial={{ opacity: 0.3, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1.15 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#16E27A]/5 blur-[120px] rounded-full pointer-events-none" 
        />
        
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              Ready to file <br />
              <span className="text-[#16E27A]">with absolute confidence?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8A96A8] leading-relaxed max-w-sm mx-auto">
              Start a temporary guest session instantly or configure a Google account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleStartWorkspace}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-3.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#16E27A]/15 active:scale-97 flex items-center justify-center gap-2 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Get started instantly</span>
              <ArrowRight className="w-4 h-4 text-[#050607]" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER ROW */}
      <footer className="border-t border-white/[0.04] bg-[#050607] py-8 px-6 md:px-12 text-center text-[10px] text-slate-550 font-bold uppercase tracking-wider flex flex-col sm:flex-row sm:justify-between items-center gap-4 transition-all duration-300">
        <div>
          TaxSense <span className="text-slate-850 font-normal">•</span> Built for Indian taxpayers <span className="text-slate-850 font-normal">•</span> FY 2025-26
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 text-slate-500">
            {/* Pulsing secure lock indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16E27A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16E27A]"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-[#16E27A]" />
            100% Secure & Private
          </span>
        </div>
      </footer>
    </div>
  );
}
