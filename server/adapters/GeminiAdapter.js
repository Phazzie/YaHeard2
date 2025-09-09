const TranscriptionService = require('../services/TranscriptionService')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

class GeminiAdapter extends TranscriptionService {
  constructor (config) {
    super(config)
    this.serviceName = 'Gemini 2.5 Flash'
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

    if (config.apiKey) {
      this.apiKey = config.apiKey
      this.isConfigured = true
    }
  }

  getSupportedFeatures () {
    return ['transcription', 'multimodal-analysis']
  }

  async transcribe (audioUrl, options = {}) {
    if (!this.isReady()) {
      return this.handleError(new Error('Gemini API key not configured'))
    }

    try {
      this.validateOptions(options)

      // First, upload the audio file to Gemini
      const uploadedFile = await this.uploadAudioFile(audioUrl)

      // Then transcribe using the uploaded file
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: 'Please transcribe this audio file accurately. Return only the transcribed text.'
            }, {
              file_data: {
                mime_type: uploadedFile.mimeType,
                file_uri: uploadedFile.uri
              }
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const transcription = response.data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!transcription) {
        throw new Error('No transcription returned from Gemini')
      }

      return this.formatResult(transcription, {
        model: 'gemini-2.0-flash-exp',
        fileUri: uploadedFile.uri
      })
    } catch (error) {
      return this.handleError(error)
    }
  }

  async uploadAudioFile (audioUrl) {
    try {
      let audioData
      let mimeType = 'audio/mpeg' // default

      if (audioUrl.startsWith('http')) {
        const response = await axios.get(audioUrl, { responseType: 'arraybuffer' })
        audioData = response.data
        mimeType = response.headers['content-type'] || 'audio/mpeg'
      } else {
        audioData = fs.readFileSync(audioUrl)
        // Determine mime type from file extension
        if (audioUrl.endsWith('.wav')) mimeType = 'audio/wav'
        if (audioUrl.endsWith('.mp3')) mimeType = 'audio/mpeg'
        if (audioUrl.endsWith('.m4a')) mimeType = 'audio/mp4'
      }

      // Upload to Gemini File API
      const formData = new FormData()
      formData.append('file', audioData, {
        contentType: mimeType,
        filename: 'audio_file'
      })

      const uploadResponse = await axios.post(
        `${this.baseUrl}/files?key=${this.apiKey}`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          }
        }
      )

      return {
        uri: uploadResponse.data.file.uri,
        mimeType: uploadResponse.data.file.mimeType
      }
    } catch (error) {
      throw new Error(`Failed to upload audio file to Gemini: ${error.message}`)
    }
  }
}

module.exports = GeminiAdapter
