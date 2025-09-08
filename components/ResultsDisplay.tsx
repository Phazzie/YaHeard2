'use client';

import { TranscriptionResult } from "@/lib/types";

interface ResultsDisplayProps {
  results: TranscriptionResult[];
  appStatus: string;
}

const accentColors = [
  'border-cyan-400',
  'border-purple-500',
  'border-green-400',
  'border-pink-500',
  'border-yellow-400',
];

const accentTextColors = [
  'text-cyan-400',
  'text-purple-500',
  'text-green-400',
  'text-pink-500',
  'text-yellow-400',
];

const SkeletonCard = () => (
  <div className="bg-white/5 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
    </div>
  </div>
);

export default function ResultsDisplay({ results, appStatus }: ResultsDisplayProps) {
  if (appStatus === 'processing') {
    return (
      <div className="w-full max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (appStatus !== 'success' || results.length === 0) {
    return null; // Don't render anything if there are no results or not in success state
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">Transcription Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {results.map((result, index) => (
          <div
            key={result.serviceName}
            className={`bg-white/5 rounded-xl p-6 border ${accentColors[index % accentColors.length]} shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
          >
            <h3 className={`text-xl font-bold mb-3 ${accentTextColors[index % accentTextColors.length]}`}>
              {result.serviceName}
            </h3>
            {result.error ? (
              <p className="text-red-400 font-mono text-sm">{result.error}</p>
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{result.transcription || 'No transcription returned.'}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
