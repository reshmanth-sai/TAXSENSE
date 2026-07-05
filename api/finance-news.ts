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

// In-memory cache for news (warm lambdas will share this cache)
let cachedNews: any[] | null = null;
let lastNewsFetchTime = 0;
const CACHE_DURATION_MS = 3600000; // 1 hour

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const now = Date.now();
    if (cachedNews && (now - lastNewsFetchTime < CACHE_DURATION_MS)) {
      console.log('Serving finance news from cache...');
      res.status(200).json({ success: true, news: cachedNews });
      return;
    }

    console.log('Generating latest finance news using Gemini...');
    const response = await generateContentWithRetryAndFallback({
      contents: `Generate 6 current, accurate Indian income tax and personal finance news items for FY 2025-26 / AY 2026-27. Each must be a single factual sentence under 120 characters. Topics should rotate between: tax saving tips, ITR deadlines, budget updates, deduction limits, capital gains rules, and TDS rules. Return ONLY a JSON array: [{ id: '1', category: 'TAX SAVING', text: '...', topic: '...' }]. Categories must be one of: TAX SAVING, BUDGET, MARKETS, HRA, SENIORS, SYSTEM, DEADLINE.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING, description: 'Must be one of: TAX SAVING, BUDGET, MARKETS, HRA, SENIORS, SYSTEM, DEADLINE' },
              text: { type: Type.STRING, description: 'A single factual sentence under 120 characters' },
              topic: { type: Type.STRING, description: 'Short keyword/topic suitable for searching' }
            },
            required: ['id', 'category', 'text', 'topic']
          }
        }
      }
    });

    const responseText = response.text?.trim() || '[]';
    const newsArray = JSON.parse(responseText);

    if (Array.isArray(newsArray) && newsArray.length > 0) {
      cachedNews = newsArray;
      lastNewsFetchTime = now;
      res.status(200).json({ success: true, news: newsArray });
    } else {
      throw new Error('Gemini returned an empty or invalid array.');
    }
  } catch (error) {
    console.error('Error generating finance news, falling back to empty list:', error);
    res.status(200).json({
      success: false,
      news: []
    });
  }
}
