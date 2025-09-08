const express = require('express')
const router = express.Router()
const TranscriptionOrchestrator = require('../services/TranscriptionOrchestrator')
const FileStorageService = require('../services/FileStorageService')
const config = require('../config')

// Initialize services
const orchestrator = new TranscriptionOrchestrator(config)
const fileStorage = new FileStorageService(config)

/**
 * GET /api/services
 * Get available transcription services
 */
router.get('/services', (req, res) => {
  try {
    const services = orchestrator.getAvailableServices()
    const storageReady = fileStorage.isReady()

    res.json({
      success: true,
      storage: {
        ready: storageReady,
        provider: 'DigitalOcean Spaces'
      },
      transcription: {
        available: services.length,
        services
      },
      config: config.isValid()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/upload
 * Upload audio file to DigitalOcean Spaces
 */
router.post('/upload', (req, res) => {
  if (!fileStorage.isReady()) {
    return res.status(500).json({
      success: false,
      error: 'File storage not configured'
    })
  }

  const upload = fileStorage.getUploadMiddleware({
    maxFileSize: 100 * 1024 * 1024 // 100MB
  })

  upload.single('audio')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      })
    }

    res.json({
      success: true,
      file: {
        url: req.file.location,
        key: req.file.key,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      }
    })
  })
})

/**
 * POST /api/transcribe
 * Transcribe audio using all available services
 */
router.post('/transcribe', async (req, res) => {
  try {
    const { audioUrl, options = {} } = req.body

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        error: 'audioUrl is required'
      })
    }

    const result = await orchestrator.transcribeWithAllServices(audioUrl, options)

    // Add analysis of results
    if (result.success) {
      result.analysis = orchestrator.analyzeResults(result.results)
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/transcribe/:service
 * Transcribe audio using a specific service
 */
router.post('/transcribe/:service', async (req, res) => {
  try {
    const { service } = req.params
    const { audioUrl, options = {} } = req.body

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        error: 'audioUrl is required'
      })
    }

    const result = await orchestrator.transcribeWithService(service, audioUrl, options)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/files
 * List uploaded files
 */
router.get('/files', async (req, res) => {
  try {
    if (!fileStorage.isReady()) {
      return res.status(500).json({
        success: false,
        error: 'File storage not configured'
      })
    }

    const files = await fileStorage.listFiles()
    res.json({
      success: true,
      files
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/files/:key
 * Delete uploaded file
 */
router.delete('/files/:key(*)', async (req, res) => {
  try {
    const { key } = req.params

    if (!fileStorage.isReady()) {
      return res.status(500).json({
        success: false,
        error: 'File storage not configured'
      })
    }

    await fileStorage.deleteFile(key)
    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
