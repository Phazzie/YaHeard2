import OpenAI from 'openai';
import { TranscriptionResult } from '../types';
import { BaseTranscriptionService } from './baseService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService extends BaseTranscriptionService {
  readonly name = 'OpenAI Whisper';
  protected readonly apiKey = process.env.OPENAI_API_KEY;

  protected async performTranscription(audioUrl: string): Promise<TranscriptionResult> {
    // The OpenAI SDK needs a file stream, so we first fetch the audio from the URL.
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }

    const transcription = await openai.audio.transcriptions.create({
      file: response, // The SDK can handle the response object directly
      model: process.env.OPENAI_MODEL || 'whisper-1',
    });

    return {
      serviceName: this.name,
      transcription: transcription.text,
    };
  }
}

export default new OpenAIService();
