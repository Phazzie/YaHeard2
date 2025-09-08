'use client';

import { useState, useCallback } from 'react';

// Define the component's props
interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  setAppStatus: (status: string) => void;
  appStatus: string;
}

export default function FileUploader({ onUploadSuccess, setAppStatus, appStatus }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
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

    try {
      // 1. Get a pre-signed URL from our API
      const presignedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get pre-signed URL.');
      }

      const { signedUrl, publicUrl } = await presignedResponse.json();

      // 2. Upload the file directly to DigitalOcean Spaces
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file.');
      }

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
        className={`relative block w-full rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${isDragOver ? 'border-solid border-cyan-400 shadow-lg shadow-cyan-400/20' : ''}`}
      >
        <UploaderIcon />
        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300">
          <span>Upload a file</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={appStatus === 'uploading' || appStatus === 'processing'} />
        </label>
        <p className="pl-1">or drag and drop</p>
        {file && <p className="mt-2 text-sm text-gray-400">{file.name}</p>}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!file || appStatus === 'uploading' || appStatus === 'processing'}
          className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
        >
          {appStatus === 'uploading' ? 'Uploading...' : appStatus === 'processing' ? 'Processing...' : 'Transcribe'}
        </button>
      </div>
    </div>
  );
}
