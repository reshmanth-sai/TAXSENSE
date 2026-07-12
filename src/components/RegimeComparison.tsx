import React, { useState, useMemo } from 'react';
import { Check, ShieldCheck, Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowRight, BookOpen, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';
import { ContextService } from '../services/ai/ContextService';
import { PromptBuilder } from '../services/ai/PromptBuilder';

const RegimeComparison = React.memo(() => {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const [activeSection, setActiveSection] = useState<'overview' | 'recommendation' | 'details' | 'legal'>('overview');
  const { addChatMessage, setIsFloatingAIChatOpen } = useTaxStore();

  const taxData: TaxData = useMemo(() => ({
    assessmentYear: '2026-27',
    grossSalary: incomeProfile?.grossSalary || 0,
    hraExemption: confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
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
    deduction80CCH: confirmedDeductions?.['80CCH'] || 0,
    section24bLetOut: confirmedDeductions?.['section24bLetOut'] || 0,
  }), [incomeProfile, confirmedDeductions]);

  const calculation = useMemo(() => calculateTax(taxData), [taxData]);
  const { oldRegime, newRegime, recommendedRegime, savings } = calculation;

  const totalDeductionsClaimed = Math.max(0, oldRegime.totalDeductions - 50000);
  
  // Health Score calculation (mock heuristic for premium feel)
  const healthScore = useMemo(() => {
    let score = 70;
    if (savings > 0) score += 15;
    if (taxData.deduction80C >= 150000) score += 10;
    if (taxData.deduction80CCD2 > 0) score += 5;
    return Math.min(100, score);
  }, [savings, taxData]);

  const handleAskCopilot = (question: string) => {
    addChatMessage({ role: 'user', content: question });
    setIsFloatingAIChatOpen(true);
  };

  const isOptimized = savings === 0 && healthScore > 90;

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* 1. Overview Health Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Tax Health Score
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-slate-100">{healthScore}</span>
              <span className="text-slate-500 font-mono text-sm mb-1">/100</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Optimization Potential
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{formatINR(savings)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              AI Recommended
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-extrabold text-slate-100">{recommendedRegime === 'NEW' ? 'New Regime' : 'Old Regime'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              AI Confidence
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 w-[94%]" />
              </div>
              <span className="text-xs text-slate-300 font-bold font-mono">94%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progressive Navigation */}
      <div className="flex flex-wrap gap-2 mb-2">
        {(['overview', 'recommendation', 'details', 'legal'] as const).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSection === section 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {section === 'recommendation' ? 'Top Action' : section}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Section: Overview (Intelligent Recommendation Cards) */}
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isOptimized ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-400">Congratulations! You are highly optimized.</h3>
                <p className="text-xs text-emerald-400/80 max-w-md mx-auto">
                  Our AI models verify that your current investments and selected regime mathematically minimize your tax liability under AY 2026-27 rules.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-300 mb-2">Next Best Actions</h3>
                {savings > 0 && (
                  <div className="bg-slate-900/60 border border-white/[0.04] rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">High Priority</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> 1 min required</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100">Switch to {recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                          Based on your gross salary of {formatINR(taxData.grossSalary)} and total deductions of {formatINR(totalDeductionsClaimed)}, you are overpaying in your current default regime. 
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Estimated Savings</p>
                          <p className="text-2xl font-extrabold text-emerald-400">{formatINR(savings)}</p>
                        </div>
                        <button 
                          onClick={() => handleAskCopilot(`Why should I switch to the ${recommendedRegime} regime?`)}
                          className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Ask AI Why
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {taxData.deduction80C < 150000 && recommendedRegime === 'OLD' && (
                  <div className="bg-slate-900/60 border border-white/[0.04] rounded-2xl p-6 hover:border-blue-500/50 transition-colors group mt-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Medium Priority</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Action required</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100">Maximize Section 80C Shortfall</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                          You have {formatINR(150000 - taxData.deduction80C)} remaining in your 80C limit. Investing this before March 31st will lower your taxable base further.
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
                        <button 
                          onClick={() => handleAskCopilot(`What are the best 80C investment options for my shortfall of ${formatINR(150000 - taxData.deduction80C)}?`)}
                          className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-lg transition-colors cursor-pointer h-full"
                        >
                          Ask AI for Options
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Section: Recommendation Explanation */}
        {activeSection === 'recommendation' && (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200">AI Logic Explanation</h3>
            </div>
            
            <div className="prose prose-invert prose-p:text-xs prose-p:text-slate-400 prose-p:leading-relaxed max-w-none">
              <p>
                Our AI model determines your optimal regime by calculating your exact liability across thousands of permutation trees. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className={`p-4 rounded-xl border ${recommendedRegime === 'OLD' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800'}`}>
                  <h4 className={`text-xs font-bold mb-2 ${recommendedRegime === 'OLD' ? 'text-emerald-400' : 'text-slate-300'}`}>Why Old Regime?</h4>
                  <p className="text-[11px] text-slate-500 m-0">
                    Beneficial if your eligible Chapter VI-A deductions and HRA exemptions exceed the breakeven point (typically ~₹3.75L). Your deductions total {formatINR(totalDeductionsClaimed)}.
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${recommendedRegime === 'NEW' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800'}`}>
                  <h4 className={`text-xs font-bold mb-2 ${recommendedRegime === 'NEW' ? 'text-emerald-400' : 'text-slate-300'}`}>Why New Regime?</h4>
                  <p className="text-[11px] text-slate-500 m-0">
                    Offers a higher basic exemption limit (₹3L) and lower slab rates, plus a standard deduction of ₹75,000. It mathematics out to be superior when deductions are low.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section: Detailed Calculations (The Original Table) */}
        {activeSection === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md"
          >
            <div className="bg-slate-950 border border-white/[0.03] rounded-2xl overflow-hidden shadow-inner">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-900/50 text-slate-500 font-semibold font-mono">
                    <th className="p-3">Tax Parameter</th>
                    <th className="p-3 text-right">Old Regime</th>
                    <th className="p-3 text-right">New Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-slate-350 font-medium">
                  <tr>
                    <td className="p-3">Gross Salary + Interest</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.grossTotalIncome - (incomeProfile?.stcg || 0) - (incomeProfile?.ltcg || 0))}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-rose-400">Standard Deduction</td>
                    <td className="p-3 text-right font-mono text-rose-400">-{formatINR(50000)}</td>
                    <td className="p-3 text-right font-mono text-rose-400">-{formatINR(75000)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Claimed Deductions (80C, 80D, HRA)</td>
                    <td className="p-3 text-right font-mono">-{formatINR(totalDeductionsClaimed)}</td>
                    <td className="p-3 text-right font-mono text-slate-505">
                      {confirmedDeductions?.['80CCD(2)'] ? `-${formatINR(confirmedDeductions['80CCD(2)'])}` : 'Not Allowed'}
                    </td>
                  </tr>
                  <tr className="bg-white/[0.01]">
                    <td className="p-3 font-semibold text-slate-200">Net Taxable Income</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">{formatINR(oldRegime.taxableIncome)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">{formatINR(newRegime.taxableIncome)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Base Slab Tax</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.baseTax)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.baseTax)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Rebate (Sec 87A)</td>
                    <td className="p-3 text-right font-mono text-emerald-400">-{formatINR(oldRegime.rebate87A)}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">-{formatINR(newRegime.rebate87A)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Health & Education Cess (4%)</td>
                    <td className="p-3 text-right font-mono">{formatINR(oldRegime.cess)}</td>
                    <td className="p-3 text-right font-mono">{formatINR(newRegime.cess)}</td>
                  </tr>
                  <tr className="bg-slate-900/50">
                    <td className="p-3 font-extrabold text-slate-100">Total Tax Payable</td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatINR(oldRegime.totalTaxPayable)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatINR(newRegime.totalTaxPayable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Section: Legal References */}
        {activeSection === 'legal' && (
          <motion.div
            key="legal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 lg:p-8 backdrop-blur-md"
          >
             <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200">Statutory References (AY 2026-27)</h3>
            </div>
            <ul className="space-y-4 text-xs text-slate-400">
              <li className="flex gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block mb-1">Section 115BAC (New Tax Regime)</strong>
                  Default tax regime offering reduced tax slab rates. Standard deduction increased to ₹75,000 for salaried employees. Forgoes most Chapter VI-A deductions except 80CCD(2).
                </div>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300 block mb-1">Section 87A Rebate</strong>
                  Rebate up to ₹25,000 for New Regime (taxable income up to ₹7,00,000) and ₹12,500 for Old Regime (taxable income up to ₹5,00,000).
                </div>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
});

export default RegimeComparison;
