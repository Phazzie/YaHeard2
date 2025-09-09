import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'

class ApiService {
  constructor () {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 300000, // 5 minutes for transcription
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method.toUpperCase(), config.url)
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url)
        return response
      },
      (error) => {
        console.error('API Error:', error.response?.status, error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Get available services and configuration
   */
  async getServices () {
    try {
      const response = await this.api.get('/services')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Upload audio file to DigitalOcean Spaces
   */
  async uploadFile (file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('audio', file)

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }

      const response = await this.api.post('/upload', formData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Transcribe audio using all available services
   */
  async transcribeAudio (audioUrl, options = {}) {
    try {
      const response = await this.api.post('/transcribe', {
        audioUrl,
        options
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Transcribe audio using a specific service
   */
  async transcribeWithService (service, audioUrl, options = {}) {
    try {
      const response = await this.api.post(`/transcribe/${service}`, {
        audioUrl,
        options
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get list of uploaded files
   */
  async getFiles () {
    try {
      const response = await this.api.get('/files')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile (key) {
    try {
      const response = await this.api.delete(`/files/${encodeURIComponent(key)}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get health status
   */
  async getHealth () {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError (error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || 'Server error occurred',
        status: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your connection.',
        status: 0,
        data: null
      }
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
        data: null
      }
    }
  }
}

// Create singleton instance
const apiService = new ApiService()
export default apiService
