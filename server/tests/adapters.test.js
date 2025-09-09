const OpenAIWhisperAdapter = require('../adapters/OpenAIWhisperAdapter')
const GeminiAdapter = require('../adapters/GeminiAdapter')
const AssemblyAIAdapter = require('../adapters/AssemblyAIAdapter')
const ElevenLabsAdapter = require('../adapters/ElevenLabsAdapter')
const axios = require('axios')

jest.mock('axios')
jest.mock('assemblyai')

describe('Adapter Tests', () => {
  const mockConfig = {
    apiKey: 'test-key'
  }
  const audioUrl = 'http://example.com/audio.mp3'

  describe('OpenAIWhisperAdapter', () => {
    it('should call the OpenAI API with the correct parameters', async () => {
      const adapter = new OpenAIWhisperAdapter(mockConfig)
      const mockTranscription = {
        text: 'test transcription',
        language: 'en',
        duration: 10,
        words: []
      }
      adapter.client.audio.transcriptions.create = jest.fn().mockResolvedValue(mockTranscription)
      axios.get.mockResolvedValue({ data: 'stream' })

      await adapter.transcribe(audioUrl)

      expect(axios.get).toHaveBeenCalledWith(audioUrl, { responseType: 'stream' })
      expect(adapter.client.audio.transcriptions.create).toHaveBeenCalledWith({
        file: 'stream',
        model: 'whisper-1',
        language: undefined,
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      })
    })
  })

  describe('GeminiAdapter', () => {
    it('should call the Gemini API with the correct parameters', async () => {
      const adapter = new GeminiAdapter(mockConfig)
      const mockUploadResponse = {
        data: {
          file: {
            uri: 'gemini-uri',
            mimeType: 'audio/mpeg'
          }
        }
      }
      const mockTranscriptionResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: 'test transcription'
              }]
            }
          }]
        }
      }
      axios.get.mockResolvedValue({ data: 'stream', headers: { 'content-type': 'audio/mpeg' } })
      axios.post.mockResolvedValueOnce(mockUploadResponse).mockResolvedValueOnce(mockTranscriptionResponse)

      await adapter.transcribe(audioUrl)

      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/files?key=test-key'), expect.any(Object), expect.any(Object))
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/models/gemini-2.5-pro:generateContent?key=test-key'), expect.any(Object), expect.any(Object))
    })
  })

  describe('AssemblyAIAdapter', () => {
    it('should call the AssemblyAI API with the correct parameters', async () => {
      const adapter = new AssemblyAIAdapter(mockConfig)
      const mockTranscript = {
        id: 'transcript-id',
        status: 'completed',
        text: 'test transcription',
        language_code: 'en',
        audio_duration: 10
      }

      const mockTranscripts = {
        create: jest.fn().mockResolvedValue({ id: 'transcript-id' }),
        waitUntilReady: jest.fn().mockResolvedValue(mockTranscript)
      }

      // Correctly mock the client property
      adapter.client = {
        transcripts: mockTranscripts
      }

      await adapter.transcribe(audioUrl, {})

      expect(mockTranscripts.create).toHaveBeenCalledWith({
        audio_url: audioUrl,
        speaker_labels: true,
        sentiment_analysis: true,
        auto_highlights: true,
        punctuate: true,
        format_text: true
      })
      expect(mockTranscripts.waitUntilReady).toHaveBeenCalledWith('transcript-id')
    })
  })

  describe('ElevenLabsAdapter', () => {
    it('should call the ElevenLabs API with the correct parameters', async () => {
      const adapter = new ElevenLabsAdapter(mockConfig)
      const mockTranscriptionResponse = {
        data: {
          text: 'test transcription'
        }
      }
      axios.get.mockResolvedValue({ data: 'stream', headers: { 'content-type': 'audio/mpeg' } })
      axios.post.mockResolvedValue(mockTranscriptionResponse)

      await adapter.transcribe(audioUrl)

      expect(axios.post).toHaveBeenCalledWith('https://api.elevenlabs.io/v1/speech-to-text', expect.any(Object), expect.any(Object))
    })
  })
})
