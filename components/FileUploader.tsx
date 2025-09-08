'use client';

import { useState, useCallback } from 'react';

// Define the component's props
interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  setAppStatus: (status: string) => void;
  appStatus: string;
}

const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/x-m4a'];

export default function FileUploader({ onUploadSuccess, setAppStatus, appStatus }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File) => {
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload an audio file.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setAppStatus('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Get a pre-signed URL from our API
      const presignedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      });

      if (!presignedResponse.ok) throw new Error('Failed to get pre-signed URL.');
      const { signedUrl, publicUrl } = await presignedResponse.json();

      // 2. Upload the file directly using XMLHttpRequest to track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed due to a network error.'));
        xhr.send(file);
      });

      // 3. Notify the parent component of success
      onUploadSuccess(publicUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setAppStatus('error');
    }
  };

  const UploaderIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative block w-full rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-400 focus:outline-none transition-all duration-300 ${isDragOver ? 'border-solid border-cyan-400 shadow-lg shadow-cyan-400/20' : ''}`}
      >
        <UploaderIcon />
        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300">
          <span>Upload an audio file</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ACCEPTED_AUDIO_TYPES.join(',')} disabled={appStatus === 'uploading' || appStatus === 'processing'} />
        </label>
        <p className="pl-1">or drag and drop</p>
        {file && <p className="mt-2 text-sm text-gray-400">{file.name}</p>}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {appStatus === 'uploading' && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!file || appStatus === 'uploading' || appStatus === 'processing'}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
        >
          {appStatus === 'uploading' ? `Uploading... ${uploadProgress}%` : appStatus === 'processing' ? 'Processing...' : 'Transcribe'}
        </button>
      </div>
    </div>
  );
}
