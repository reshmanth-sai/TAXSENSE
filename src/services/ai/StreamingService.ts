export class StreamingService {
  /**
   * Consumes a streamed response from the backend API and calls the `onChunk` callback
   * iteratively to create a real-time typing effect.
   */
  static async streamResponse(
    url: string, 
    body: any, 
    onChunk: (text: string) => void,
    onComplete: () => void,
    onError: (err: Error) => void
  ) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          // Assuming the backend sends Server-Sent Events (SSE) format: 'data: "text"\n\n'
          const lines = chunk.split('\\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  onChunk(fullText);
                }
              } catch (e) {
                // If it's not valid JSON, it might be raw text chunks. Handle gracefully.
              }
            }
          }
        }
      }
      
      onComplete();
    } catch (err: any) {
      onError(err);
    }
  }
}
