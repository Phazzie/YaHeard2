const TranscriptionService = require('../services/TranscriptionService');
const { AssemblyAI } = require('assemblyai');

class AssemblyAIAdapter extends TranscriptionService {
  constructor(config) {
    super(config);
    this.serviceName = 'AssemblyAI';
    
    if (config.apiKey) {
      this.client = new AssemblyAI({
        apiKey: config.apiKey
      });
      this.isConfigured = true;
    }
  }

  getSupportedFeatures() {
    return ['transcription', 'speaker-detection', 'sentiment-analysis', 'topic-detection'];
  }

  async transcribe(audioUrl, options = {}) {
    if (!this.isReady()) {
      return this.handleError(new Error('AssemblyAI API key not configured'));
    }

    try {
      const validatedOptions = this.validateOptions(options);
      
      const config = {
        audio_url: audioUrl,
        speaker_labels: true,
        sentiment_analysis: true,
        auto_highlights: true,
        punctuate: true,
        format_text: true
      };

      if (validatedOptions.language && validatedOptions.language !== 'auto') {
        config.language_code = validatedOptions.language;
      }

      const transcript = await this.client.transcripts.create(config);
      
      // Wait for transcription to complete
      const completedTranscript = await this.client.transcripts.waitUntilReady(transcript.id);

      if (completedTranscript.status === 'error') {
        throw new Error(completedTranscript.error);
      }

      return this.formatResult(completedTranscript.text, {
        confidence: completedTranscript.confidence,
        language: completedTranscript.language_code,
        duration: completedTranscript.audio_duration,
        speakers: completedTranscript.utterances?.length || 0,
        sentiment: completedTranscript.sentiment_analysis_results,
        highlights: completedTranscript.auto_highlights_result?.results,
        words: completedTranscript.words
      });

    } catch (error) {
      return this.handleError(error);
    }
  }

  validateOptions(options) {
    const validated = super.validateOptions(options);
    
    // AssemblyAI specific validations
    const supportedLanguages = [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'hi', 'ja', 'zh', 'ko', 'ru'
    ];
    
    if (validated.language && validated.language !== 'auto' && !supportedLanguages.includes(validated.language)) {
      validated.language = 'auto';
    }

    return validated;
  }
}

module.exports = AssemblyAIAdapter;