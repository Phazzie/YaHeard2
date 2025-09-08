import OpenAI from 'openai';
import { TranscriptionService, TranscriptionResult } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService implements TranscriptionService {
  name = 'OpenAI Whisper';

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        serviceName: this.name,
        transcription: null,
        error: 'API key is not configured for this service.',
      };
    }

    try {
      // The OpenAI SDK needs a file stream, so we first fetch the audio from the URL.
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }

      const transcription = await openai.audio.transcriptions.create({
        file: response, // The SDK can handle the response object directly
        model: 'whisper-1',
      });

      return {
        serviceName: this.name,
        transcription: transcription.text,
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        serviceName: this.name,
        transcription: null,
        error: errorMessage,
      };
    }
  }
}

export default new OpenAIService();
