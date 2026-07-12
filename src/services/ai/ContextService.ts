import { useTaxStore } from '../../store/useTaxStore';

export interface AIContextPayload {
  grossSalary: number;
  tdsDeducted: number;
  deductions: Record<string, number>;
  regime: 'NEW' | 'OLD';
  formType: 'ITR-1' | 'ITR-2';
  hasCapitalGains: boolean;
  uploadedFilesCount: number;
}

export class ContextService {
  /**
   * Captures the current snapshot of the user's financial profile
   * to build a highly contextual prompt for the AI.
   */
  static getCurrentContext(): AIContextPayload {
    const state = useTaxStore.getState();
    const income = state.incomeProfile;
    const deductions = state.confirmedDeductions;
    
    const hasCapitalGains = (income.stcg || 0) > 0 || (income.ltcg || 0) > 0;
    const formType = hasCapitalGains ? 'ITR-2' : state.formType || 'ITR-1';
    
    return {
      grossSalary: income.grossSalary || 0,
      tdsDeducted: income.tdsDeducted || 0,
      deductions: {
        '80C': deductions['80C'] || 0,
        '80D': deductions['80D'] || 0,
        'HRA': deductions['HRA exemption'] || deductions.hraExemption || 0,
        '80CCD(1B)': deductions['80CCD(1B)'] || 0,
        '80CCD(2)': deductions['80CCD(2)'] || 0,
        'Section 24b': deductions.section24b || 0,
      },
      regime: 'NEW', // Default assumption, to be derived if needed
      formType,
      hasCapitalGains,
      uploadedFilesCount: state.uploadedFiles?.length || 0
    };
  }
}
