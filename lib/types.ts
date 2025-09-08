/**
 * This is the contract that every new transcription service module must implement.
 */
export interface TranscriptionService {
  name: string;
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
  checkHealth(): Promise<'operational' | 'down'>;
}

/**
 * This is the standardized format for returning data from any transcription service.
 */
export interface TranscriptionResult {
  serviceName: string;
  transcription: string | null;
  error?: string;
}
