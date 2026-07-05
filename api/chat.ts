import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function generateContentWithRetryAndFallback(params: {
  contents: any;
  config?: any;
}) {
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempts = 0;
    const maxAttempts = 5;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        console.log(`Attempting generateContent using model: ${modelName} (attempt ${attempts + 1}/${maxAttempts})`);
        const aiInstance = getAI();
        const response = await aiInstance.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        attempts++;
        const errorObject = error?.error || error;
        const errorStatus = error?.status || error?.statusCode || errorObject?.code || errorObject?.status;
        const errorMessage = error?.message || errorObject?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        
        const isUnavailable = 
          errorStatus === 'UNAVAILABLE' || 
          errorStatus === 503 || 
          errorStatus === '503' ||
          errorMessage.includes('503') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('high demand') ||
          errorMessage.includes('Resource has been exhausted') ||
          errorMessage.includes('overloaded');

        if (isUnavailable && attempts < maxAttempts) {
          console.warn(`Model ${modelName} unavailable. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          console.warn(`Model ${modelName} failed on attempt ${attempts}/${maxAttempts}:`, errorMessage);
          break;
        }
      }
    }
  }
  throw lastError || new Error('Failed to generate content after trying multiple fallback models.');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { messages, taxData, chatHistory, incomeProfile, confirmedDeductions, activeStep, guidedFilingStep } = req.body;
    
    const resolvedMessages = messages || chatHistory;
    if (!resolvedMessages || !Array.isArray(resolvedMessages)) {
      res.status(400).json({ error: 'Conversation messages array is required.' });
      return;
    }

    const resolvedTaxData = taxData || {
      ...incomeProfile,
      hraExemption: confirmedDeductions?.['HRA exemption'] ?? confirmedDeductions?.hraExemption ?? 0,
      deduction80C: confirmedDeductions?.['80C'] ?? 0,
      deduction80CCD1B: confirmedDeductions?.['80CCD(1B)'] ?? 0,
      deduction80CCD2: confirmedDeductions?.['80CCD(2)'] ?? 0,
      deduction80D: confirmedDeductions?.['80D'] ?? 0,
      deduction80DD: confirmedDeductions?.['80DD'] ?? 0,
      deduction80U: confirmedDeductions?.['80U'] ?? 0,
      deduction80DDB: confirmedDeductions?.['80DDB'] ?? 0,
      deduction80E: confirmedDeductions?.['80E'] ?? 0,
      deduction80EEA: confirmedDeductions?.['80EEA'] ?? 0,
      deduction80G: confirmedDeductions?.['80G'] ?? 0,
      deduction80GG: confirmedDeductions?.['80GG'] ?? 0,
      deduction80TTA: confirmedDeductions?.['80TTA'] ?? 0,
      deduction80TTB: confirmedDeductions?.['80TTB'] ?? 0,
      section24b: confirmedDeductions?.section24b ?? 0,
      stcg: incomeProfile?.stcg ?? 0,
      ltcg: incomeProfile?.ltcg ?? 0,
      grossSalary: incomeProfile?.grossSalary ?? 0,
      otherIncome: incomeProfile?.otherIncome ?? 0,
      tdsDeducted: incomeProfile?.tdsDeducted ?? 0,
      formType: req.body.formType || incomeProfile?.formType || 'ITR-1'
    };

    const stcg = Number(resolvedTaxData?.stcg) || 0;
    const ltcg = Number(resolvedTaxData?.ltcg) || 0;
    const calculatedFormType = (stcg > 0 || ltcg > 0) ? 'ITR-2' : (resolvedTaxData?.formType || 'ITR-1');

    const activeStepNum = Number(activeStep) || 3;
    const getStageName = (step: number) => {
      switch(step) {
        case 3: return "Document Vault";
        case 4: return "AI Analysis Scanner";
        case 5: return "Optimizations & Regime Recommendations";
        case 6: return "Guided ITR Filing Workspace (Step " + (guidedFilingStep || 1) + " of 5)";
        case 10: return "Filing History & Archives";
        case 11: return "Dashboard Command Center";
        default: return "TaxSense Companion Hub";
      }
    };

    const systemInstruction = `You are TaxSense AI, a premium, high-trust Indian income tax advisor and filing assistant.
    The user is currently on the stage: "${getStageName(activeStepNum)}" in the Guided Filing dashboard.
    Provide concise, authoritative, and helpful tax advice based strictly on Indian Income Tax Act rules for Assessment Year 2026-27 (Financial Year 2025-26).
    Never fabricate data or suggest illegal tax evasion.
    
    Here is the taxpayer's active financial profile parsed in their local browser sandbox:
    - Assessment Year: AY 2026-27 (FY 2025-26)
    - Eligible ITR Form: ${calculatedFormType} (Sahaj/ITR-1 if salary only; ITR-2 if capital gains present)
    - Taxpayer Name: ${resolvedTaxData?.employeeName || 'Mohit Kumar'}
    - Gross Salary (Sec. 17(1)): ₹${(resolvedTaxData?.grossSalary || 0).toLocaleString('en-IN')}
    - HRA Exemption: ₹${(resolvedTaxData?.hraExemption || 0).toLocaleString('en-IN')}
    - Section 80C Deductions: ₹${(resolvedTaxData?.deduction80C || 0).toLocaleString('en-IN')} (EPF, PPF, ELSS, Life Insurance, Home Loan Principal)
    - Section 80D Deductions: ₹${(resolvedTaxData?.deduction80D || 0).toLocaleString('en-IN')} (Medical Insurance Premium)
    - Other Income (Bank interest, etc.): ₹${(resolvedTaxData?.otherIncome || 0).toLocaleString('en-IN')}
    - TDS Deducted: ₹${(resolvedTaxData?.tdsDeducted || 0).toLocaleString('en-IN')}
    
    Portfolio & Capital Gains (ITR-2):
    - Short-Term Capital Gains (STCG, Section 111A): ₹${stcg.toLocaleString('en-IN')} (Taxed at flat 20% on listed equity under Union Budget 2024)
    - Long-Term Capital Gains (LTCG, Section 112A): ₹${ltcg.toLocaleString('en-IN')} (Taxed at flat 12.5% after ₹1.25 Lakhs annual exemption ceiling)

    Be hyper-personalized!
    - If user is on ITR-2, congratulate them on portfolio sync, explain that simple ITR-1 (Sahaj) does not permit capital gains reporting, and advise them on how the 20% STCG and 12.5% LTCG (after ₹1.25L exemption) are taxed separately from slab rates.
    - Check if they have maxed out 80C (₹1,50,000). If not, suggest options like PPF, EPF, ELSS, or LIC.
    - Recommend New vs Old based on their numbers. Present New Regime with ₹75,000 standard deduction + 80CCD(2), and contrast it with Old regime which allows standard 80C, 80D, HRA etc.
    - Keep responses friendly but professional. Maintain a high-trust, financial-grade tone. Do not use sales hype.`;

    const contents = resolvedMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await generateContentWithRetryAndFallback({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.status(200).json({
      success: true,
      reply: response.text || `I am here to help you file your ${calculatedFormType}. Please ask me any questions about your tax slabs, deductions, or capital gains!`,
    });
  } catch (error: any) {
    console.error('Error during chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat conversation.' });
  }
}
