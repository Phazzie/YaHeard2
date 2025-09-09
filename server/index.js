const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const config = require('./config')

const app = express()

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com', 'https://api.assemblyai.com', 'https://generativelanguage.googleapis.com', 'https://api.elevenlabs.io']
    }
  }
}))

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api', limiter)

// Body parsing middleware
app.use(express.json({ limit: config.BODY_SIZE_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: config.BODY_SIZE_LIMIT }))

// API routes
app.use('/api', require('./routes/api'))

// Health check endpoint
app.get('/health', (req, res) => {
  const configValidation = config.isValid()
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    environment: config.NODE_ENV,
    config: configValidation
  })
})

// Serve static files in production
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  })
} else {
  // Development mode - API only
  app.get('/', (req, res) => {
    res.json({
      message: 'YaHeard2 API Server',
      version: require('../package.json').version,
      environment: 'development',
      endpoints: {
        health: '/health',
        services: '/api/services',
        upload: '/api/upload',
        transcribe: '/api/transcribe',
        files: '/api/files'
      }
    })
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      maxSize: config.BODY_SIZE_LIMIT
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field'
    })
  }

  res.status(err.status || 500).json({
    success: false,
    error: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(config.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  })
})

// Start server
const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`🚀 YaHeard2 server running on port ${PORT}`)
  console.log(`📊 Environment: ${config.NODE_ENV}`)

  const configValidation = config.isValid()
  console.log('⚙️  Configuration:', configValidation)

  if (!configValidation.valid) {
    console.warn('⚠️  Warning: Server started with incomplete configuration')
    if (!configValidation.aiServices) {
      console.warn('   - No AI transcription services configured')
    }
    if (!configValidation.storage) {
      console.warn('   - DigitalOcean Spaces not configured')
    }
  }

  console.log(`🌐 Access the API at: http://localhost:${PORT}`)
})

module.exports = app
