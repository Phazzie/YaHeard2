import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { TranscriptionService, TranscriptionResult } from '../types';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

class ElevenLabsService implements TranscriptionService {
  name = 'ElevenLabs';

  async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    if (!process.env.ELEVENLABS_API_KEY) {
      return {
        serviceName: this.name,
        transcription: null,
        error: 'API key is not configured for this service.',
      };
    }

    try {
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
        voiceId: "21m00Tcm4TlvDq8ikWAM", // A default voiceId is required, though not used for transcription
      });

      // The transcription is returned in the results
      const transcription = results.map(result => result.text).join(' ');

      return {
        serviceName: this.name,
        transcription: transcription,
      };
    } catch (error) {
      console.error('ElevenLabs Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        serviceName: this.name,
        transcription: null,
        error: errorMessage,
      };
    }
  }
}

export default new ElevenLabsService();
