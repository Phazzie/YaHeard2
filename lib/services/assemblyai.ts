import { AssemblyAI } from 'assemblyai';
import { TranscriptionService, TranscriptionResult } from '../types';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

class AssemblyAIService implements TranscriptionService {
  name = 'AssemblyAI';

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return {
        serviceName: this.name,
        transcription: null,
        error: 'API key is not configured for this service.',
      };
    }

    try {
      const transcript = await client.transcripts.transcribe({
        audio: audioUrl,
      });

      if (transcript.status === 'error') {
        return {
          serviceName: this.name,
          transcription: null,
          error: transcript.error,
        };
      }

      return {
        serviceName: this.name,
        transcription: transcript.text,
      };
    } catch (error) {
      console.error('AssemblyAI Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        serviceName: this.name,
        transcription: null,
        error: errorMessage,
      };
    }
  }
}

export default new AssemblyAIService();
