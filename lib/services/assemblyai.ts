import { AssemblyAI } from 'assemblyai';
import { TranscriptionResult } from '../types';
import { BaseTranscriptionService } from './baseService';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

class AssemblyAIService extends BaseTranscriptionService {
  readonly name = 'AssemblyAI';
  protected readonly apiKey = process.env.ASSEMBLYAI_API_KEY;

  protected async performTranscription(audioUrl: string): Promise<TranscriptionResult> {
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
  }
}

export default new AssemblyAIService();
