'use client';

import { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import ResultsDisplay from '@/components/ResultsDisplay';
import ConsensusDisplay from '@/components/ConsensusDisplay';
import { TranscriptionResult } from '@/lib/types';

type AppStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function Home() {
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [consensus, setConsensus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<Record<string, 'operational' | 'down'>>({});

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setServiceHealth(data);
        }
      } catch (err) {
        console.error("Failed to fetch service health:", err);
      }
    };
    fetchHealth();
  }, []);

  const handleUploadSuccess = async (publicUrl: string) => {
    setAppStatus('processing');
    setError(null);
    setResults([]);
    setConsensus('');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: publicUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { consensus, individualResults } = await response.json();
      setResults(individualResults);
      setConsensus(consensus);
      setAppStatus('success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setAppStatus('error');
    }
  };

  const resetApp = () => {
    setAppStatus('idle');
    setResults([]);
    setError(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 md:p-24 bg-gradient-to-b from-[#0D0C1D] to-[#121132]">
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
          Ya Heard?
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Upload an audio file and compare transcriptions from leading AI services.
        </p>
      </header>

      {appStatus === 'idle' || appStatus === 'uploading' ? (
        <FileUploader
          onUploadSuccess={handleUploadSuccess}
          setAppStatus={(status) => setAppStatus(status as AppStatus)}
          appStatus={appStatus}
        />
      ) : (
        <>
          {consensus && <ConsensusDisplay consensusText={consensus} />}
          <ResultsDisplay results={results} appStatus={appStatus} healthStatus={serviceHealth} />
          {error && (
            <div className="mt-8 text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 font-bold">An Error Occurred</p>
              <p className="text-red-400">{error}</p>
            </div>
          )}
          <button
            onClick={resetApp}
            className="mt-12 py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
          >
            Transcribe Another File
          </button>
        </>
      )}
    </main>
  );
}
