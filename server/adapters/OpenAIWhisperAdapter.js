const TranscriptionService = require('../services/TranscriptionService');
const OpenAI = require('openai');
const fs = require('fs');
const axios = require('axios');

class OpenAIWhisperAdapter extends TranscriptionService {
  constructor(config) {
    super(config);
    this.serviceName = 'OpenAI Whisper';
    
    if (config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey
      });
      this.isConfigured = true;
    }
  }

  getSupportedFeatures() {
    return ['transcription', 'translation', 'language-detection'];
  }

  async transcribe(audioUrl, options = {}) {
    if (!this.isReady()) {
      return this.handleError(new Error('OpenAI API key not configured'));
    }

    try {
      const validatedOptions = this.validateOptions(options);
      
      // Download audio file if it's a URL
      let audioFile;
      if (audioUrl.startsWith('http')) {
        const response = await axios.get(audioUrl, { responseType: 'stream' });
        audioFile = response.data;
      } else {
        audioFile = fs.createReadStream(audioUrl);
      }

      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: validatedOptions.language === 'auto' ? undefined : validatedOptions.language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      return this.formatResult(transcription.text, {
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words,
        model: 'whisper-1'
      });

    } catch (error) {
      return this.handleError(error);
    }
  }

  validateOptions(options) {
    const validated = super.validateOptions(options);
    
    // OpenAI Whisper specific validations
    if (validated.language && validated.language !== 'auto') {
      // Validate language code format (ISO 639-1)
      const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
      if (!validLanguages.includes(validated.language)) {
        validated.language = 'auto';
      }
    }

    return validated;
  }
}

module.exports = OpenAIWhisperAdapter;