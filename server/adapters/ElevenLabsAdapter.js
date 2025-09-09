const TranscriptionService = require('../services/TranscriptionService')
const axios = require('axios')
const FormData = require('form-data')

class ElevenLabsAdapter extends TranscriptionService {
  constructor (config) {
    super(config)
    this.serviceName = 'ElevenLabs'
    this.baseUrl = 'https://api.elevenlabs.io/v1'

    if (config.apiKey) {
      this.apiKey = config.apiKey
      this.isConfigured = true
    }
  }

  getSupportedFeatures () {
    return ['transcription', 'speech-synthesis']
  }

  async transcribe (audioUrl, options = {}) {
    if (!this.isReady()) {
      return this.handleError(new Error('ElevenLabs API key not configured'))
    }

    try {
      const validatedOptions = this.validateOptions(options)

      // Get a stream from the URL
      const responseStream = await axios.get(audioUrl, { responseType: 'stream' })
      const mimeType = responseStream.headers['content-type'] || 'audio/mpeg'

      const formData = new FormData()
      formData.append('audio', responseStream.data, {
        filename: 'audio.mp3',
        contentType: mimeType
      })

      // Add model and other parameters
      formData.append('model', 'whisper-large-v3')

      if (validatedOptions.language && validatedOptions.language !== 'auto') {
        formData.append('language', validatedOptions.language)
      }

      const response = await axios.post(
        `${this.baseUrl}/speech-to-text`,
        formData,
        {
          headers: {
            Accept: 'application/json',
            'xi-api-key': this.apiKey,
            ...formData.getHeaders()
          }
        }
      )

      const result = response.data

      return this.formatResult(result.text || result.transcript, {
        language: result.detected_language,
        confidence: result.confidence,
        model: 'whisper-large-v3'
      })
    } catch (error) {
      // ElevenLabs might return different error format
      if (error.response?.data) {
        const errorMsg = error.response.data.detail || error.response.data.message || error.message
        return this.handleError(new Error(errorMsg))
      }
      return this.handleError(error)
    }
  }

  validateOptions (options) {
    // No specific validation needed for ElevenLabs, a part from the base validation.
    return super.validateOptions(options)
  }
}

module.exports = ElevenLabsAdapter
