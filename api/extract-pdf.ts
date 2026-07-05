import { VercelRequest, VercelResponse } from '@vercel/node';
import Multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const upload = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false, // Disables standard body parsing so multer can handle multipart stream
  },
};

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

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    console.log('PDF received. File size:', req.file.size);
    const base64Data = req.file.buffer.toString('base64');

    const ai = getAI();
    console.log('Sending PDF buffer to Gemini for extraction...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'application/pdf'
          }
        },
        'Please extract all text content from this Form 16 PDF document. Return ONLY the plain text characters from the document, preserving labels and values. Do not summarize or format as JSON.'
      ]
    });

    res.status(200).json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Error during PDF parsing:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF file.' });
  }
}
