import { TranscriptionService, TranscriptionResult } from '../types';

/**
 * An abstract base class for transcription services to handle common logic
 * like API key checks and standardized error handling.
 */
export abstract class BaseTranscriptionService implements TranscriptionService {
  /**
   * The unique name of the transcription service.
   */
  abstract readonly name: string;

  /**
   * The API key for the service, read from environment variables.
   */
  protected abstract readonly apiKey: string | undefined;

  /**
   * The core transcription logic that must be implemented by each subclass.
   * @param audioUrl The public URL of the audio file to transcribe.
   * @returns A promise that resolves to a TranscriptionResult.
   */
  protected abstract performTranscription(audioUrl: string): Promise<TranscriptionResult>;

  /**
   * The public-facing `transcribe` method that acts as a template.
   * It wraps the core logic with API key checks and a try-catch block.
   */
  public async transcribe(audioUrl: string): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      return {
        serviceName: this.name,
        transcription: null,
        error: `API key for ${this.name} is not configured.`,
      };
    }

    try {
      return await this.performTranscription(audioUrl);
    } catch (error) {
      console.error(`${this.name} Error:`, error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        // Check for common API key-related error messages
        if (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('authentication')) {
          errorMessage = `Authentication error. Please check the API key for ${this.name}.`;
        } else {
          errorMessage = error.message;
        }
      }
      return {
        serviceName: this.name,
        transcription: null,
        error: errorMessage,
      };
    }
  }

  /**
   * Performs a basic health check for the service.
   * The default implementation considers the service "operational" if the API key is configured.
   * Subclasses can override this for more specific health checks (e.g., pinging a status endpoint).
   */
  public async checkHealth(): Promise<'operational' | 'down'> {
    return this.apiKey ? 'operational' : 'down';
  }
}
