const TranscriptionService = require('../services/TranscriptionService')
const OpenAI = require('openai')
const axios = require('axios')

class OpenAIWhisperAdapter extends TranscriptionService {
  constructor (config) {
    super(config)
    this.serviceName = 'OpenAI Whisper'

    if (config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey
      })
      this.isConfigured = true
    }
  }

  getSupportedFeatures () {
    return ['transcription', 'translation', 'language-detection']
  }

  async transcribe (audioUrl, options = {}) {
    if (!this.isReady()) {
      return this.handleError(new Error('OpenAI API key not configured'))
    }

    try {
      const validatedOptions = this.validateOptions(options)

      // The OpenAI SDK expects a file stream. We can create one from the URL.
      const response = await axios.get(audioUrl, { responseType: 'stream' })
      const audioFile = response.data

      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: validatedOptions.language === 'auto' ? undefined : validatedOptions.language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      })

      return this.formatResult(transcription.text, {
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words,
        model: 'whisper-1'
      })
    } catch (error) {
      return this.handleError(error)
    }
  }

  validateOptions (options) {
    // No specific validation needed for Whisper, a part from the base validation.
    return super.validateOptions(options)
  }
}

module.exports = OpenAIWhisperAdapter
