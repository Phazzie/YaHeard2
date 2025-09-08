const OpenAIWhisperAdapter = require('../adapters/OpenAIWhisperAdapter');
const AssemblyAIAdapter = require('../adapters/AssemblyAIAdapter');
const GeminiAdapter = require('../adapters/GeminiAdapter');
const ElevenLabsAdapter = require('../adapters/ElevenLabsAdapter');

class TranscriptionOrchestrator {
  constructor(config) {
    this.services = {};
    this.config = config;
    this.initializeServices();
  }

  initializeServices() {
    // Initialize all available services
    if (this.config.OPENAI_API_KEY) {
      this.services.openai = new OpenAIWhisperAdapter({
        apiKey: this.config.OPENAI_API_KEY
      });
    }

    if (this.config.ASSEMBLYAI_API_KEY) {
      this.services.assemblyai = new AssemblyAIAdapter({
        apiKey: this.config.ASSEMBLYAI_API_KEY
      });
    }

    if (this.config.GEMINI_API_KEY) {
      this.services.gemini = new GeminiAdapter({
        apiKey: this.config.GEMINI_API_KEY
      });
    }

    if (this.config.ELEVENLABS_API_KEY) {
      this.services.elevenlabs = new ElevenLabsAdapter({
        apiKey: this.config.ELEVENLABS_API_KEY
      });
    }
  }

  /**
   * Get list of available and configured services
   * @returns {Array}
   */
  getAvailableServices() {
    return Object.keys(this.services)
      .map(key => this.services[key].getServiceInfo())
      .filter(service => service.ready);
  }

  /**
   * Get service by name
   * @param {string} serviceName
   * @returns {TranscriptionService|null}
   */
  getService(serviceName) {
    return this.services[serviceName] || null;
  }

  /**
   * Transcribe audio using a specific service
   * @param {string} serviceName
   * @param {string} audioUrl
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async transcribeWithService(serviceName, audioUrl, options = {}) {
    const service = this.getService(serviceName);
    if (!service) {
      return {
        service: serviceName,
        error: true,
        message: `Service '${serviceName}' not available or not configured`,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await service.transcribe(audioUrl, options);
      return result;
    } catch (error) {
      return service.handleError(error);
    }
  }

  /**
   * Transcribe audio using all available services
   * @param {string} audioUrl
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async transcribeWithAllServices(audioUrl, options = {}) {
    const availableServices = this.getAvailableServices();
    
    if (availableServices.length === 0) {
      return {
        error: true,
        message: 'No transcription services are configured',
        timestamp: new Date().toISOString(),
        results: []
      };
    }

    const transcriptionPromises = Object.keys(this.services).map(async (serviceName) => {
      try {
        const result = await this.transcribeWithService(serviceName, audioUrl, options);
        return { serviceName, ...result };
      } catch (error) {
        return {
          serviceName,
          service: serviceName,
          error: true,
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Wait for all transcriptions to complete (or fail)
    const results = await Promise.allSettled(transcriptionPromises);
    
    const transcriptionResults = results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          error: true,
          message: result.reason.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Calculate summary statistics
    const successfulResults = transcriptionResults.filter(r => !r.error);
    const failedResults = transcriptionResults.filter(r => r.error);

    return {
      success: successfulResults.length > 0,
      audioUrl,
      options,
      timestamp: new Date().toISOString(),
      summary: {
        total: transcriptionResults.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        services: availableServices.map(s => s.name)
      },
      results: transcriptionResults
    };
  }

  /**
   * Get comparison analysis of multiple transcription results
   * @param {Array} results
   * @returns {Object}
   */
  analyzeResults(results) {
    const successfulResults = results.filter(r => !r.error && r.text);
    
    if (successfulResults.length === 0) {
      return {
        comparison: 'No successful transcriptions to compare',
        confidence: 0,
        wordCounts: {},
        similarities: []
      };
    }

    const wordCounts = {};
    const textLengths = {};
    
    successfulResults.forEach(result => {
      const words = result.text.toLowerCase().split(/\s+/).length;
      wordCounts[result.service] = words;
      textLengths[result.service] = result.text.length;
    });

    return {
      wordCounts,
      textLengths,
      avgConfidence: this.calculateAverageConfidence(successfulResults),
      longestTranscription: this.findLongestTranscription(successfulResults),
      shortestTranscription: this.findShortestTranscription(successfulResults)
    };
  }

  calculateAverageConfidence(results) {
    const confidenceValues = results
      .map(r => r.confidence)
      .filter(c => c !== null && c !== undefined);
    
    if (confidenceValues.length === 0) return null;
    
    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  findLongestTranscription(results) {
    return results.reduce((longest, current) => 
      current.text.length > longest.text.length ? current : longest
    );
  }

  findShortestTranscription(results) {
    return results.reduce((shortest, current) => 
      current.text.length < shortest.text.length ? current : shortest
    );
  }
}

module.exports = TranscriptionOrchestrator;