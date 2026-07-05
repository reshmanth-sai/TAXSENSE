import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';

export default function RegimeComparison() {
  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const [showDetails, setShowDetails] = useState(false);

  // Map Zustand store profile directly to the TaxData structure expected by calculateTax helper
  const taxData: TaxData = {
    assessmentYear: '2026-27',
    grossSalary: incomeProfile.grossSalary || 0,
    hraExemption: confirmedDeductions['HRA exemption'] || confirmedDeductions.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    otherIncome: incomeProfile.otherIncome || 0,
    deduction80C: confirmedDeductions['80C'] || 0,
    deduction80D: confirmedDeductions['80D'] || 0,
    deduction80TTA: confirmedDeductions['80TTA'] || 0,
    deduction80G: confirmedDeductions['80G'] || 0,
    section24b: confirmedDeductions['section24b'] || 0,
    tdsDeducted: incomeProfile.tdsDeducted || 0,
    // Capital Gains
    stcg: incomeProfile.stcg || 0,
    ltcg: incomeProfile.ltcg || 0,
    // Advanced & Portfolio fields
    deduction80CCD1B: confirmedDeductions['80CCD(1B)'] || 0,
    deduction80CCD2: confirmedDeductions['80CCD(2)'] || 0,
    deduction80DD: confirmedDeductions['80DD'] || 0,
    deduction80U: confirmedDeductions['80U'] || 0,
    deduction80DDB: confirmedDeductions['80DDB'] || 0,
    deduction80E: confirmedDeductions['80E'] || 0,
    deduction80EEA: confirmedDeductions['80EEA'] || 0,
    deduction80GG: confirmedDeductions['80GG'] || 0,
    deduction80TTB: confirmedDeductions['80TTB'] || 0,
    deduction80CCH: confirmedDeductions['80CCH'] || 0,
    section24bLetOut: confirmedDeductions['section24bLetOut'] || 0,
  };

  // Perform tax calculations
  const calculation = calculateTax(taxData);
  const { oldRegime, newRegime, recommendedRegime, savings } = calculation;

  const maxTax = Math.max(oldRegime.totalTaxPayable, newRegime.totalTaxPayable, 1000);
  const oldPct = (oldRegime.totalTaxPayable / maxTax) * 100;
  const newPct = (newRegime.totalTaxPayable / maxTax) * 100;

  // Total Chapter VI-A deductions (excluding Standard Deduction of 50k)
  const totalDeductionsClaimed = Math.max(0, oldRegime.totalDeductions - 50000);

  // Capital gains tax components for display
  const stcgTax = Math.round((incomeProfile.stcg || 0) * 0.20);
  const ltcgTaxable = Math.max(0, (incomeProfile.ltcg || 0) - 125000);
  const ltcgTax = Math.round(ltcgTaxable * 0.125);
  const totalCGTax = stcgTax + ltcgTax;

  return (
    <div id="regime-comparison-card" className="bg-slate-900/40 border border-white/[0.04] rounded-[24px] p-6 backdrop-blur-md text-slate-100 flex flex-col justify-between transition-colors duration-200 w-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Liability Comparison</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">AY 2026-27 Side-by-Side Analysis</p>
          </div>
          {savings > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Optimal Choice Found</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-semibold rounded-full">
              Equal Tax
            </div>
          )}
        </div>

        {/* Dynamic comparison bars with Spring Animations */}
        <div className="space-y-5">
          {/* Old Regime bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                Old Tax Regime
                {recommendedRegime === 'OLD' && (
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 flex items-center gap-0.5 font-extrabold uppercase font-mono">
                    <Check className="h-2.5 w-2.5" /> Best Choice
                  </span>
                )}
              </span>
              <span className={`font-mono font-bold text-sm ${recommendedRegime === 'OLD' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {formatINR(oldRegime.totalTaxPayable)}
              </span>
            </div>
            <div className="h-3 bg-slate-950 rounded-lg overflow-hidden border border-slate-900 p-0.5">
              <motion.div
                className={`h-full rounded-md ${
                  recommendedRegime === 'OLD' ? 'bg-emerald-500 shadow-md shadow-emerald-500/15' : 'bg-slate-700'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(6, oldPct)}%` }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              />
            </div>
          </div>

          {/* New Regime bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                New Tax Regime (Sec 115BAC)
                {recommendedRegime === 'NEW' && (
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 flex items-center gap-0.5 font-extrabold uppercase font-mono">
                    <Check className="h-2.5 w-2.5" /> Best Choice
                  </span>
                )}
              </span>
              <span className={`font-mono font-bold text-sm ${recommendedRegime === 'NEW' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {formatINR(newRegime.totalTaxPayable)}
              </span>
            </div>
            <div className="h-3 bg-slate-950 rounded-lg overflow-hidden border border-slate-900 p-0.5">
              <motion.div
                className={`h-full rounded-md ${
                  recommendedRegime === 'NEW' ? 'bg-emerald-500 shadow-md shadow-emerald-500/15' : 'bg-slate-700'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(6, newPct)}%` }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              />
            </div>
          </div>
        </div>

        {/* Progressive Disclosure detailed calculations */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer focus:outline-none"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showDetails ? "Hide detailed tax breakdown" : "View detailed parameter calculations"}</span>
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-slate-950 border border-white/[0.03] rounded-2xl overflow-hidden shadow-inner mt-2">
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
                        <td className="p-3 text-right font-mono">{formatINR(oldRegime.grossTotalIncome - (incomeProfile.stcg || 0) - (incomeProfile.ltcg || 0))}</td>
                        <td className="p-3 text-right font-mono">{formatINR(newRegime.grossTotalIncome - (incomeProfile.stcg || 0) - (incomeProfile.ltcg || 0))}</td>
                      </tr>
                      {((incomeProfile.stcg || 0) > 0 || (incomeProfile.ltcg || 0) > 0) && (
                        <tr className="bg-amber-500/[0.02]">
                          <td className="p-3 text-slate-200 font-semibold">Capital Gains Total</td>
                          <td className="p-3 text-right font-mono">{formatINR((incomeProfile.stcg || 0) + (incomeProfile.ltcg || 0))}</td>
                          <td className="p-3 text-right font-mono">{formatINR((incomeProfile.stcg || 0) + (incomeProfile.ltcg || 0))}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="p-3 text-rose-400">Standard Deduction</td>
                        <td className="p-3 text-right font-mono text-rose-400">-{formatINR(50000)}</td>
                        <td className="p-3 text-right font-mono text-rose-400">-{formatINR(75000)}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Claimed Deductions (80C, 80D, HRA)</td>
                        <td className="p-3 text-right font-mono">-{formatINR(totalDeductionsClaimed)}</td>
                        <td className="p-3 text-right font-mono text-slate-505">
                          {confirmedDeductions['80CCD(2)'] ? `-${formatINR(confirmedDeductions['80CCD(2)'])}` : 'Not Allowed'}
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
                      {totalCGTax > 0 && (
                        <tr className="bg-amber-500/[0.02]">
                          <td className="p-3 text-amber-405 pl-5">→ Capital Gains Tax</td>
                          <td className="p-3 text-right font-mono text-amber-400">+{formatINR(totalCGTax)}</td>
                          <td className="p-3 text-right font-mono text-amber-400">+{formatINR(totalCGTax)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="p-3">Section 87A Rebate</td>
                        <td className="p-3 text-right font-mono text-rose-400">-{formatINR(oldRegime.rebate87A)}</td>
                        <td className="p-3 text-right font-mono text-rose-400">-{formatINR(newRegime.rebate87A)}</td>
                      </tr>
                      <tr>
                        <td className="p-3">Cess (4%)</td>
                        <td className="p-3 text-right font-mono">{formatINR(oldRegime.cess)}</td>
                        <td className="p-3 text-right font-mono">{formatINR(newRegime.cess)}</td>
                      </tr>
                      <tr className="bg-slate-900/50 font-bold border-t border-white/[0.04]">
                        <td className="p-3 text-slate-200">Total Tax Liability</td>
                        <td className={`p-3 text-right font-mono font-extrabold text-sm ${recommendedRegime === 'OLD' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {formatINR(oldRegime.totalTaxPayable)}
                        </td>
                        <td className={`p-3 text-right font-mono font-extrabold text-sm ${recommendedRegime === 'NEW' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {formatINR(newRegime.totalTaxPayable)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 mt-6 ${
        recommendedRegime === 'NEW' 
          ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-350' 
          : 'bg-blue-500/5 border-blue-500/10 text-slate-350'
      }`}>
        <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 ${recommendedRegime === 'NEW' ? 'text-emerald-450' : 'text-blue-400'}`} />
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-200">
            RECOMMENDED ROUTE: {recommendedRegime === 'NEW' ? 'NEW TAX REGIME' : 'OLD TAX REGIME'}
          </h4>
          <p className="text-xs leading-relaxed font-medium">
            {savings > 0 ? (
              <span>
                Selecting the <strong>{recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime</strong> saves exactly <strong className="text-emerald-400 font-mono font-bold">{formatINR(savings)}</strong>. 
                {recommendedRegime === 'NEW' 
                  ? ' The New Regime grants a flat ₹75,000 standard deduction and lower intermediate slabs.' 
                  : ' Your Section 80C, Section 80D and HRA rent exemptions yield a better deduction threshold.'}
              </span>
            ) : (
              <span>
                Both tax regimes result in identical tax liability. We recommend the <strong>New Regime</strong> to simplify ITR filing and minimize record-keeping.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
