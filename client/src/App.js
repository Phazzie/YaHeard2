import React, { useState, useEffect } from 'react'
import './styles/App.css'
import FileUpload from './components/FileUpload'
import TranscriptionResults from './components/TranscriptionResults'
import ServiceStatus from './components/ServiceStatus'
import apiService from './services/api'

function App () {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionResults, setTranscriptionResults] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUploaded = (file) => {
    setUploadedFile(file)
    setError(null)
  }

  const handleUploadStart = () => {
    setIsUploading(true)
    setError(null)
  }

  const handleUploadComplete = () => {
    setIsUploading(false)
  }

  const startTranscription = async () => {
    if (!uploadedFile) {
      setError('Please upload an audio file first')
      return
    }

    try {
      setIsTranscribing(true)
      setError(null)
      setTranscriptionResults(null)

      const result = await apiService.transcribeAudio(uploadedFile.url)

      if (result.success) {
        setTranscriptionResults(result)
      } else {
        throw new Error(result.message || 'Transcription failed')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during transcription')
      console.error('Transcription error:', err)
    } finally {
      setIsTranscribing(false)
    }
  }

  const resetAll = () => {
    setUploadedFile(null)
    setTranscriptionResults(null)
    setError(null)
    setIsUploading(false)
    setIsTranscribing(false)
  }

  // Effect to handle upload completion
  useEffect(() => {
    if (uploadedFile && isUploading) {
      handleUploadComplete()
    }
  }, [uploadedFile, isUploading])

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>YaHeard2</h1>
          <p>
            Compare AI transcription services side-by-side. Upload your audio file and see how
            different AI models transcribe the same content.
          </p>
        </header>

        <main>
          <ServiceStatus />

          <div className="upload-section card">
            <h2>🎵 Upload Audio File</h2>
            <FileUpload
              onFileUploaded={handleFileUploaded}
              isUploading={isUploading}
              onUploadStart={handleUploadStart}
            />

            {uploadedFile && (
              <div className="uploaded-file-info">
                <div className="file-details">
                  <h3>✅ File Uploaded Successfully</h3>
                  <div className="file-meta">
                    <span><strong>Name:</strong> {uploadedFile.originalname}</span>
                    <span><strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span><strong>Type:</strong> {uploadedFile.mimetype}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={startTranscription}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? '🔄 Transcribing...' : '🚀 Start Transcription'}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={resetAll}
                    disabled={isTranscribing}
                  >
                    🔄 Upload New File
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message card">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          )}

          <TranscriptionResults
            results={transcriptionResults?.results}
            isLoading={isTranscribing}
            analysis={transcriptionResults?.analysis}
          />
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>
              &copy; 2024 YaHeard2 - Multi-Service AI Audio Transcription Comparison
            </p>
            <div className="footer-links">
              <span>Powered by OpenAI, AssemblyAI, Gemini & ElevenLabs</span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .uploaded-file-info {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .file-details h3 {
          color: var(--accent-emerald);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .file-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          margin: 2rem 0;
        }

        .error-message h3 {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .error-message p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .footer {
          margin-top: 4rem;
          padding: 2rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
          }
          
          .file-meta {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}

export default App
