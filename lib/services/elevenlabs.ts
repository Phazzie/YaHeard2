import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { TranscriptionResult } from '../types';
import { BaseTranscriptionService } from './baseService';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

class ElevenLabsService extends BaseTranscriptionService {
  readonly name = 'ElevenLabs';
  protected readonly apiKey = process.env.ELEVENLABS_API_KEY;

  protected async performTranscription(audioUrl: string): Promise<TranscriptionResult> {
    // Fetch the audio file from the URL to create a stream
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }

    // The SDK expects a readable stream
    const audioStream = response.body;
    if (!audioStream) {
      throw new Error('Could not get readable stream from audio response.');
    }

    const { results } = await elevenlabs.speechToSpeech.convert({
      audio: audioStream,
      voiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
    });

    // The transcription is returned in the results
    const transcription = results.map(result => result.text).join(' ');

    return {
      serviceName: this.name,
      transcription: transcription,
    };
  }
}

export default new ElevenLabsService();
