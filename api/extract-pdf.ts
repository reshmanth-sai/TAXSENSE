import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Dynamic import to isolate load-time errors
    console.log('Dynamically importing pdf-parse...');
    const { PDFParse } = await import('pdf-parse');
    
    res.status(200).json({ 
      status: 'success', 
      message: 'PDFParse loaded successfully!',
      type: typeof PDFParse 
    });
  } catch (error: any) {
    console.error('Import error caught:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Failed to import pdf-parse',
      stack: error.stack 
    });
  }
}
