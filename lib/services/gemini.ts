import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { TranscriptionService, TranscriptionResult } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

class GeminiService implements TranscriptionService {
  name = 'Google Gemini';

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        serviceName: this.name,
        transcription: null,
        error: 'API key is not configured for this service.',
      };
    }

    try {
      // Fetch the audio file and get its MIME type and base64 data
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType) {
        throw new Error('Could not determine content type of audio file.');
      }
      const buffer = await response.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

      const audioPart = {
        inlineData: {
          data: base64Data,
          mimeType: contentType,
        },
      };

      const result = await model.generateContent([
        "Please provide a verbatim transcript of the audio.",
        audioPart,
      ]);

      const transcription = result.response.text();

      return {
        serviceName: this.name,
        transcription: transcription,
      };
    } catch (error) {
      console.error('Gemini Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        serviceName: this.name,
        transcription: null,
        error: errorMessage,
      };
    }
  }
}

export default new GeminiService();
