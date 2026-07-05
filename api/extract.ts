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

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content from Form 16 is required.' });
      return;
    }

    const response = await generateContentWithRetryAndFallback({
      contents: `Please extract standard tax parameters from the following Form 16 text and return it strictly as JSON according to the schema.
      Extract ALL deduction fields visible in Part B of the Form 16. For any field not explicitly present in the document, return null — do not guess or assume values.
      Look for standard terms:
      - "Gross Salary" or "Section 17(1)" or "Salary as per provisions contained in section 17(1)" for gross salary.
      - "HRA" or "House Rent Allowance" or "10(13A)" for HRA exemption.
      - "Standard Deduction" or "Section 16(ia)" for standard deduction (usually 50,000 in old regimes).
      - "80C" or "Provident Fund" or "PPF" or "ELSS" or "Life Insurance" or "Section 80C" for 80C.
      - "80D" or "Health Insurance" or "Section 80D" for 80D.
      - "80CCD(1B)" or "NPS" for standalone NPS.
      - "80E" or "Education Loan" for education loan interest.
      - "80G" or "Donation" or "Charitable" for charitable donations.
      - "80TTA" or "Savings Bank Interest" for 80TTA.
      - "Section 24" or "24(b)" or "Interest on Borrowed Capital" or "Home Loan Interest" for section 24b.
      - "Basic" or "Basic Salary" or "Basic Pay" for basicSalary.
      - "Other Income" or "Income from Other Sources" or "Section 56" for otherIncome.
      - "TDS" or "Tax Deducted at Source" or "Total tax deducted" or "Section 192" for TDS.

      Here is the Form 16 text:
      ${text}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessmentYear: { type: Type.STRING, description: 'The assessment year e.g. "2025-26"' },
            employeeName: { type: Type.STRING, description: 'Full name of the employee/taxpayer', nullable: true },
            pan: { type: Type.STRING, description: 'PAN of the employee/taxpayer', nullable: true },
            grossSalary: { type: Type.INTEGER, description: 'Gross Salary amount in INR' },
            hraExemption: { type: Type.INTEGER, description: 'HRA exemption amount computed and shown in Form 16 Part B.', nullable: true },
            ltaExemption: { type: Type.INTEGER, description: 'LTA exemption in INR', nullable: true },
            otherIncome: { type: Type.INTEGER, description: 'Any other income declared.', nullable: true },
            deduction80C: { type: Type.INTEGER, description: 'Total 80C deductions (EPF+PPF+ELSS+LIC+home loan principal). Cap ₹1,50,000.', nullable: true },
            deduction80D: { type: Type.INTEGER, description: 'Health insurance premium paid. Cap ₹25,000 self / ₹50,000 parents.', nullable: true },
            deduction80CCD1B: { type: Type.INTEGER, description: 'Standalone NPS contribution under 80CCD(1B). Cap ₹50,000.', nullable: true },
            deduction80E: { type: Type.INTEGER, description: 'Education loan interest paid under Section 80E.', nullable: true },
            deduction80G: { type: Type.INTEGER, description: 'Charitable donations under Section 80G.', nullable: true },
            deduction80TTA: { type: Type.INTEGER, description: 'Savings bank interest under 80TTA. Cap ₹10,000.', nullable: true },
            section24b: { type: Type.INTEGER, description: 'Home loan interest under Section 24(b). Cap ₹2,00,000.', nullable: true },
            basicSalary: { type: Type.INTEGER, description: 'Basic salary component.', nullable: true },
            tdsDeducted: { type: Type.INTEGER, description: 'Tax Deducted at Source (TDS) in INR', nullable: true },
            employerName: { type: Type.STRING, description: 'Name of the employer company', nullable: true },
            pfContribution: { type: Type.INTEGER, description: 'Provident Fund (PF) contribution amount', nullable: true }
          },
          required: ['grossSalary'],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonStr);

    res.status(200).json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error during extraction:', error);
    res.status(500).json({ error: error.message || 'Failed to extract Form 16 data.' });
  }
}
