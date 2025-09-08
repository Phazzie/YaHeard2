import React from 'react';

const TranscriptionResults = ({ results, isLoading, analysis }) => {
  if (isLoading) {
    return (
      <div className="results-section">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>
            <h3>Transcribing your audio...</h3>
            <p>This may take a few minutes depending on the file size and number of services.</p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const successfulResults = results.filter(r => !r.error);
  const failedResults = results.filter(r => r.error);

  return (
    <div className="results-section">
      <div className="results-header">
        <h2>Transcription Results</h2>
        <div className="results-summary">
          <span className="status-indicator online">
            <span className="status-dot"></span>
            {successfulResults.length} successful
          </span>
          {failedResults.length > 0 && (
            <span className="status-indicator offline">
              <span className="status-dot"></span>
              {failedResults.length} failed
            </span>
          )}
        </div>
      </div>

      {analysis && (
        <div className="analysis-summary card">
          <h3>Analysis Summary</h3>
          <div className="analysis-grid">
            {analysis.avgConfidence && (
              <div className="analysis-item">
                <span className="analysis-label">Average Confidence</span>
                <span className="analysis-value">{Math.round(analysis.avgConfidence * 100)}%</span>
              </div>
            )}
            <div className="analysis-item">
              <span className="analysis-label">Word Count Range</span>
              <span className="analysis-value">
                {Math.min(...Object.values(analysis.wordCounts || {}))} - {Math.max(...Object.values(analysis.wordCounts || {}))}
              </span>
            </div>
            {analysis.longestTranscription && (
              <div className="analysis-item">
                <span className="analysis-label">Most Detailed</span>
                <span className="analysis-value">{analysis.longestTranscription.service}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="results-grid">
        {successfulResults.map((result, index) => (
          <TranscriptionCard key={index} result={result} />
        ))}
        
        {failedResults.map((result, index) => (
          <ErrorCard key={`error-${index}`} result={result} />
        ))}
      </div>

      <style jsx>{`
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .results-summary {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .analysis-summary {
          margin-bottom: 2rem;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .analysis-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .analysis-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .analysis-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .results-summary {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

const TranscriptionCard = ({ result }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="result-card success">
      <div className="service-name">
        <span>{result.service}</span>
        <span className="service-badge success">✓ Success</span>
      </div>
      
      <div className="transcription-text">
        {result.text}
      </div>
      
      <div className="result-metadata">
        {result.confidence && (
          <div className="metadata-item">
            <span>Confidence:</span>
            <span className="confidence-score">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
        )}
        
        {result.duration && (
          <div className="metadata-item">
            <span>Duration:</span>
            <span>{formatDuration(result.duration)}</span>
          </div>
        )}
        
        {result.language && (
          <div className="metadata-item">
            <span>Language:</span>
            <span>{result.language.toUpperCase()}</span>
          </div>
        )}
        
        <div className="metadata-item">
          <span>Words:</span>
          <span>{result.text.split(/\s+/).length}</span>
        </div>
      </div>
      
      <div className="result-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => copyToClipboard(result.text)}
          title="Copy transcription"
        >
          📋 Copy
        </button>
      </div>

      <style jsx>{`
        .result-metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin: 1rem 0;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metadata-item span:first-child {
          color: var(--text-muted);
          font-weight: 500;
        }

        .metadata-item span:last-child {
          color: var(--text-primary);
          font-weight: 600;
        }

        .confidence-score {
          color: var(--accent-emerald) !important;
        }

        .result-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .result-actions button {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }
      `}</style>
    </div>
  );
};

const ErrorCard = ({ result }) => {
  return (
    <div className="result-card error">
      <div className="service-name">
        <span>{result.service || result.serviceName}</span>
        <span className="service-badge error">✗ Error</span>
      </div>
      
      <div className="error-message">
        <p>{result.message || 'An unknown error occurred'}</p>
        {result.code && (
          <span className="error-code">Error Code: {result.code}</span>
        )}
      </div>
      
      <style jsx>{`
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .error-message p {
          margin: 0;
          color: #ef4444;
        }

        .error-code {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default TranscriptionResults;