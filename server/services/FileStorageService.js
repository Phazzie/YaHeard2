const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')

class FileStorageService {
  constructor (config) {
    this.config = config
    this.isConfigured = this.validateConfig()

    if (this.isConfigured) {
      this.spacesEndpoint = new AWS.Endpoint(config.SPACES_ENDPOINT)

      this.s3 = new AWS.S3({
        endpoint: this.spacesEndpoint,
        accessKeyId: config.SPACES_ACCESS_KEY_ID,
        secretAccessKey: config.SPACES_SECRET_ACCESS_KEY,
        region: config.SPACES_REGION
      })

      this.bucketName = config.SPACES_BUCKET_NAME
    }
  }

  validateConfig () {
    const required = [
      'SPACES_ENDPOINT',
      'SPACES_ACCESS_KEY_ID',
      'SPACES_SECRET_ACCESS_KEY',
      'SPACES_REGION',
      'SPACES_BUCKET_NAME'
    ]

    return required.every(key => this.config[key])
  }

  /**
   * Get multer middleware for direct upload to Spaces
   * @param {Object} options
   * @returns {multer.Multer}
   */
  getUploadMiddleware (options = {}) {
    if (!this.isConfigured) {
      throw new Error('DigitalOcean Spaces not properly configured')
    }

    const upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.bucketName,
        acl: 'public-read',
        key: function (req, file, cb) {
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(7)
          const extension = path.extname(file.originalname)
          const filename = `audio/${timestamp}-${randomString}${extension}`
          cb(null, filename)
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            uploadedAt: new Date().toISOString()
          })
        }
      }),
      limits: {
        fileSize: options.maxFileSize || 100 * 1024 * 1024 // 100MB default
      },
      fileFilter: (req, file, cb) => {
        // Accept audio files
        const allowedMimes = [
          'audio/mpeg',
          'audio/wav',
          'audio/mp3',
          'audio/mp4',
          'audio/m4a',
          'audio/webm',
          'audio/ogg'
        ]

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('Invalid file type. Only audio files are allowed.'), false)
        }
      }
    })

    return upload
  }

  /**
   * Upload file directly from buffer or stream
   * @param {Buffer|Stream} fileData
   * @param {string} filename
   * @param {string} contentType
   * @returns {Promise<Object>}
   */
  async uploadFile (fileData, filename, contentType) {
    if (!this.isConfigured) {
      throw new Error('DigitalOcean Spaces not properly configured')
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = path.extname(filename)
    const key = `audio/${timestamp}-${randomString}${extension}`

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileData,
      ACL: 'public-read',
      ContentType: contentType,
      Metadata: {
        originalname: filename,
        uploadedAt: new Date().toISOString()
      }
    }

    try {
      const result = await this.s3.upload(params).promise()
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
        etag: result.ETag
      }
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  /**
   * Delete file from Spaces
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async deleteFile (key) {
    if (!this.isConfigured) {
      throw new Error('DigitalOcean Spaces not properly configured')
    }

    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise()
      return true
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  /**
   * Get presigned URL for temporary access
   * @param {string} key
   * @param {number} expiresIn - seconds
   * @returns {string}
   */
  getPresignedUrl (key, expiresIn = 3600) {
    if (!this.isConfigured) {
      throw new Error('DigitalOcean Spaces not properly configured')
    }

    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn
    })
  }

  /**
   * List files in the audio directory
   * @param {string} prefix
   * @param {number} maxKeys
   * @returns {Promise<Array>}
   */
  async listFiles (prefix = 'audio/', maxKeys = 100) {
    if (!this.isConfigured) {
      throw new Error('DigitalOcean Spaces not properly configured')
    }

    try {
      const result = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      }).promise()

      return result.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `https://${this.bucketName}.${this.config.SPACES_ENDPOINT}/${item.Key}`
      }))
    } catch (error) {
      throw new Error(`List files failed: ${error.message}`)
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean}
   */
  isReady () {
    return this.isConfigured
  }
}

module.exports = FileStorageService
