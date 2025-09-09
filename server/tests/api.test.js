const request = require('supertest')
const app = require('../index')

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200)

      expect(res.body.status).toBe('healthy')
      expect(res.body.version).toBeDefined()
      expect(res.body.config).toBeDefined()
    })
  })

  describe('GET /api/services', () => {
    it('should return service configuration', async () => {
      const res = await request(app)
        .get('/api/services')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.transcription).toBeDefined()
      expect(res.body.storage).toBeDefined()
    })
  })

  describe('POST /api/transcribe without file', () => {
    it('should return error when no audioUrl provided', async () => {
      const res = await request(app)
        .post('/api/transcribe')
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('audioUrl is required')
    })
  })
})

describe('TranscriptionService Interface', () => {
  const TranscriptionService = require('../services/TranscriptionService')

  it('should enforce interface contract', () => {
    const service = new TranscriptionService({})

    expect(service.isReady()).toBe(false)
    expect(service.getServiceInfo()).toEqual({
      name: 'base',
      ready: false,
      features: ['transcription']
    })

    // Should throw error when calling transcribe without implementation
    expect(async () => {
      await service.transcribe('test-url')
    }).rejects.toThrow('transcribe method must be implemented')
  })
})

describe('Configuration Validation', () => {
  const config = require('../config')

  it('should validate configuration correctly', () => {
    const validation = config.isValid()

    expect(validation).toHaveProperty('valid')
    expect(validation).toHaveProperty('aiServices')
    expect(validation).toHaveProperty('storage')
    expect(validation).toHaveProperty('configuredServices')
  })
})
