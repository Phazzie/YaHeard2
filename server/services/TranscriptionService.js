/**
 * Standard interface for all transcription services
 * This ensures consistent behavior across all AI providers
 */
class TranscriptionService {
  constructor (config) {
    this.config = config
    this.serviceName = 'base'
    this.isConfigured = false
  }

  /**
   * Check if the service is properly configured with API keys
   * @returns {boolean}
   */
  isReady () {
    return this.isConfigured
  }

  /**
   * Get service information
   * @returns {Object}
   */
  getServiceInfo () {
    return {
      name: this.serviceName,
      ready: this.isReady(),
      features: this.getSupportedFeatures()
    }
  }

  /**
   * Get supported features for this service
   * @returns {Array<string>}
   */
  getSupportedFeatures () {
    return ['transcription']
  }

  /**
   * Transcribe audio file
   * @param {string} audioUrl - URL or path to audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<TranscriptionResult>}
   */
  async transcribe (audioUrl, options = {}) {
    throw new Error('transcribe method must be implemented by service adapter')
  }

  /**
   * Validate transcription options
   * @param {Object} options
   * @returns {Object} validated options
   */
  validateOptions (options) {
    return {
      language: options.language || 'auto',
      format: options.format || 'text',
      ...options
    }
  }

  /**
   * Standard error handling
   * @param {Error} error
   * @returns {TranscriptionError}
   */
  handleError (error) {
    return {
      service: this.serviceName,
      error: true,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Format successful transcription result
   * @param {string} text - Transcribed text
   * @param {Object} metadata - Additional metadata
   * @returns {TranscriptionResult}
   */
  formatResult (text, metadata = {}) {
    return {
      service: this.serviceName,
      success: true,
      text,
      confidence: metadata.confidence || null,
      duration: metadata.duration || null,
      language: metadata.language || null,
      timestamp: new Date().toISOString(),
      metadata
    }
  }
}

module.exports = TranscriptionService
