import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptionResult } from '../types';
import { BaseTranscriptionService } from './baseService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

class GeminiService extends BaseTranscriptionService {
  readonly name = 'Google Gemini';
  protected readonly apiKey = process.env.GEMINI_API_KEY;

  protected async performTranscription(audioUrl: string): Promise<TranscriptionResult> {
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

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest' });

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
  }
}

export default new GeminiService();
