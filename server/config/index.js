require('dotenv').config();

module.exports = {
  // Server config
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BODY_SIZE_LIMIT: process.env.BODY_SIZE_LIMIT || '100mb',

  // AI Service API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,

  // DigitalOcean Spaces
  SPACES_BUCKET_NAME: process.env.SPACES_BUCKET_NAME,
  SPACES_REGION: process.env.SPACES_REGION,
  SPACES_ENDPOINT: process.env.SPACES_ENDPOINT,
  SPACES_ACCESS_KEY_ID: process.env.SPACES_ACCESS_KEY_ID,
  SPACES_SECRET_ACCESS_KEY: process.env.SPACES_SECRET_ACCESS_KEY,

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // CORS settings
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],

  // Validation
  isValid() {
    // Check if at least one AI service is configured
    const hasAIService = !!(
      this.OPENAI_API_KEY ||
      this.ASSEMBLYAI_API_KEY ||
      this.GEMINI_API_KEY ||
      this.ELEVENLABS_API_KEY
    );

    // Check if Spaces is configured
    const hasSpaces = !!(
      this.SPACES_BUCKET_NAME &&
      this.SPACES_REGION &&
      this.SPACES_ENDPOINT &&
      this.SPACES_ACCESS_KEY_ID &&
      this.SPACES_SECRET_ACCESS_KEY
    );

    return {
      valid: hasAIService && hasSpaces,
      aiServices: hasAIService,
      storage: hasSpaces,
      configuredServices: {
        openai: !!this.OPENAI_API_KEY,
        assemblyai: !!this.ASSEMBLYAI_API_KEY,
        gemini: !!this.GEMINI_API_KEY,
        elevenlabs: !!this.ELEVENLABS_API_KEY
      }
    };
  }
};