import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, TrendingUp, Sparkles, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const theme = useTaxStore((state) => state.theme) || 'light';
  const setTheme = useTaxStore((state) => state.setTheme);

  // Generate 8 twinkling particles (reduced dramatically for a calm, stable, premium background)
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.0 + 0.4, // 0.4px to 1.4px
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 8, // 8s to 18s (extremely slow, subtle twinkle)
    }));
  }, []);

  return (
    <div className="min-h-screen h-screen bg-[#050607] text-white font-sans antialiased selection:bg-[#16E27A] selection:text-[#050607] flex flex-col justify-between overflow-hidden relative">
      
      {/* Pinned fixed cinematic noise texture across the viewport */}
      <div className="cinematic-noise" />

      {/* BACKGROUND FLOATING EFFECTS: Aurora & Glows (Zero Real-Time Blurs for 60 FPS Performance) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Soft radial emerald focal spotlight behind heading with breathing pulse */}
        <div 
          style={{ background: 'radial-gradient(circle, rgba(22, 226, 122, 0.08) 0%, transparent 70%)' }}
          className="absolute top-[32%] left-[50%] w-[750px] h-[400px] pointer-events-none animate-spotlight-pulse" 
        />
        
        {/* Subtle auroral curtain glows (radial gradients instead of expensive blur filters) */}
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(22, 226, 122, 0.04) 0%, rgba(5, 150, 105, 0.01) 50%, transparent 80%)' }}
          className="absolute -top-[10%] left-[5%] w-[800px] h-[600px] animate-aurora-1" 
        />
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(5, 150, 105, 0.03) 0%, rgba(22, 226, 122, 0.01) 45%, transparent 75%)' }}
          className="absolute top-[35%] -right-[10%] w-[900px] h-[700px] animate-aurora-2" 
        />
        <div 
          style={{ background: 'radial-gradient(ellipse at center, rgba(22, 226, 122, 0.03) 0%, transparent 70%)' }}
          className="absolute bottom-[10%] left-[10%] w-[700px] h-[600px] animate-aurora-1" 
        />
      </motion.div>

      {/* TWINKLING PARTICLE FIELD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden z-10"
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
            className="absolute bg-[#16E27A]/10 rounded-full animate-particle-twinkle"
          />
        ))}
      </motion.div>

      {/* 1. Translucent Glass Navbar (with entrance fade-down) */}
      <motion.header 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-[#050607]/40 border-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.55)] transition-all duration-300"
      >
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16E27A] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#16E27A]/20">
            <svg className="w-4.5 h-4.5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-white select-none">
            Tax<span className="text-[#16E27A]">Sense</span>
          </span>
        </div>

        {/* Clean right layout: Theme toggle + primary button only */}
        <div className="flex items-center gap-3.5">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-1.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs rounded-full transition-all cursor-pointer shadow-md shadow-[#16E27A]/10 active:scale-95"
          >
            Get started
          </motion.button>
        </div>
      </motion.header>

      {/* 2. Hero Interactive Content (Occupies exactly 100vh) */}
      <main className="relative flex-1 flex flex-col justify-center z-20 overflow-hidden">
        
        {/* FLOATING GLASS CARDS (Hidden on mobile, absolutely positioned on desktop) */}
        {/* Layer division: 
            Layer 1: absolute viewport positioning & staggered entry fade up (motion.div)
            Layer 2: high-performance translation mouse parallax (standard div with CSS variables)
            Layer 3: infinite float loop & spring interactive hover scale lift (motion.div inside)
        */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
          
          {/* Card 1: Upload Form 16 (Top Left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[20%] left-[4%] w-[240px]"
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.015, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="animate-float-card-1 cursor-pointer pointer-events-auto select-none"
            >
              <div className="p-5 glass-card-premium">
                <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] flex items-center justify-center mb-3.5">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-sm">Upload Form 16</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Drag & drop your Form 16 PDF. We'll extract salary, TDS and deductions.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 2: 100% Secure (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[18%] left-[7%] w-[230px]"
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.015, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="animate-float-card-2 cursor-pointer pointer-events-auto select-none"
            >
              <div className="p-5 glass-card-premium">
                <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] flex items-center justify-center mb-3.5">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-sm">100% Secure</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Your data is encrypted end-to-end and never stored without consent.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 3: Find missed deductions (Top Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[16%] right-[5%] w-[240px]"
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.015, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="animate-float-card-3 cursor-pointer pointer-events-auto select-none"
            >
              <div className="p-5 glass-card-premium">
                <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] flex items-center justify-center mb-3.5">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-sm">Find deductions</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  AI scans 80D, NPS, HRA, home loan & more to find what you can claim.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 4: Compare regimes (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[20%] right-[7%] w-[230px]"
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.015, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="animate-float-card-4 cursor-pointer pointer-events-auto select-none"
            >
              <div className="p-5 glass-card-premium">
                <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] flex items-center justify-center mb-3.5">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-white text-sm">Compare regimes</h3>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Old vs New regime comparison to help you pay the least tax.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* HERO CENTER TEXT BLOCK */}
        <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center space-y-7 relative z-30 select-none">
          
          {/* Badge over heading */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A] text-[10px] font-bold tracking-wider uppercase"
          >
            <Sparkles className="w-3 h-3" />
            <span>Built for AY 2026-27</span>
          </motion.div>

          {/* Heading with improved tracking & visual spacing */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-[64px] font-black tracking-[-0.03em] text-white leading-[1.08] sm:leading-[1.06] max-w-2xl text-center"
          >
            File your ITR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16E27A] to-[#5BEAA5]">
              without the confusion
            </span>
          </motion.h1>

          {/* Subparagraph with refined line-height and rhythm */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-400 text-xs sm:text-sm max-w-lg leading-[1.65] tracking-wide text-center"
          >
            AI-powered tax copilot for Indian salaried employees. Upload your Form 16, discover deductions you're missing, and know exactly how much tax you owe — in minutes.
          </motion.p>

          {/* Pulsing CTA Action Button (with entrance scale-in) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pt-3 flex flex-col items-center gap-4.5 w-full"
          >
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03, y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="group flex items-center gap-2.5 px-8 py-3.5 bg-[#16E27A] hover:bg-[#5BEAA5] text-[#050607] font-black text-xs rounded-xl tracking-wide uppercase cursor-pointer shadow-lg shadow-[#16E27A]/15 hover:shadow-[#16E27A]/30 animate-cta-pulse"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5 text-[#050607]" />
            </motion.button>

            {/* Verification badging */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>₹0 for salaried individuals</span>
              <span className="text-slate-805 hidden sm:inline">•</span>
              <span>Powered by Gemini AI</span>
              <span className="text-slate-805 hidden sm:inline">•</span>
              <span>AY 2026-27 ready</span>
            </div>
          </motion.div>

          {/* MOBILE BACKUP GRID: Displayed under hero text on small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8 md:hidden pointer-events-auto">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg">
              <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 text-[#16E27A] flex items-center justify-center mb-3">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Upload Form 16</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Drag & drop your Form 16 PDF. We'll extract salary, TDS and deductions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg">
              <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 text-[#16E27A] flex items-center justify-center mb-3">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Find missed deductions</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                AI scans 80D, NPS, HRA, home loan & more to find what you can claim.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg">
              <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 text-[#16E27A] flex items-center justify-center mb-3">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Compare regimes</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Old vs New regime comparison to help you pay the least tax.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg">
              <div className="w-9 h-9 rounded-lg bg-[#16E27A]/10 text-[#16E27A] flex items-center justify-center mb-3">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">100% Secure</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Your data is encrypted end-to-end and never stored without consent.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer row */}
      <footer className="border-t border-white/[0.04] bg-transparent py-6 px-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider flex flex-col sm:flex-row sm:justify-between items-center gap-4 transition-all duration-300 relative z-30">
        <div>
          TaxSense <span className="text-slate-850">•</span> Built for Indian taxpayers <span className="text-slate-850">•</span> FY 2025-26
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#16E27A]" />
            100% Secure & Private
          </span>
        </div>
      </footer>
    </div>
  );
}
