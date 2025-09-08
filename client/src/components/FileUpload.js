import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUploaded, isUploading, onUploadStart }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      alert('Please select a valid audio file (MP3, WAV, M4A, OGG, WebM)');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      onUploadStart && onUploadStart();
      setUploadProgress(0);

      // Import API service dynamically to avoid circular dependencies
      const { default: apiService } = await import('../services/api');
      
      const result = await apiService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        onFileUploaded(result.file);
        setUploadProgress(0);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
      setUploadProgress(0);
    }
  }, [onFileUploaded, onUploadStart]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: isUploading
  });

  return (
    <div className="upload-section">
      <div 
        {...getRootProps()} 
        className={`upload-zone ${isDragActive || dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="upload-progress">
            <div className="loading-spinner"></div>
            <h3>Uploading...</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>{uploadProgress}% complete</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">🎵</div>
            <h3>Drop your audio file here</h3>
            <p>or click to browse</p>
            <div className="supported-formats">
              <span>Supported formats: MP3, WAV, M4A, OGG, WebM</span>
              <span>Max size: 100MB</span>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          width: 100%;
          max-width: 300px;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .supported-formats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .upload-zone.uploading {
          pointer-events: none;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;