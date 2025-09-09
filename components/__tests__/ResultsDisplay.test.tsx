import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDisplay from '../ResultsDisplay';
import { TranscriptionResult } from '@/lib/types';

describe('ResultsDisplay', () => {
  const mockResults: TranscriptionResult[] = [
    {
      serviceName: 'OpenAI Whisper',
      transcription: 'This is the Whisper transcript.',
      error: undefined,
    },
    {
      serviceName: 'Google Gemini',
      transcription: 'This is the Gemini transcript.',
      error: undefined,
    },
    {
      serviceName: 'AssemblyAI',
      transcription: null,
      error: 'Service timed out.',
    },
  ];

  const mockHealthStatus = {
    'OpenAI Whisper': 'operational' as const,
    'Google Gemini': 'operational' as const,
    'AssemblyAI': 'down' as const,
  };

  it('displays the transcript for each successful result', () => {
    render(<ResultsDisplay results={mockResults} appStatus="success" healthStatus={mockHealthStatus} />);

    // Check for the first successful result
    expect(screen.getByText('OpenAI Whisper')).toBeInTheDocument();
    expect(screen.getByText('This is the Whisper transcript.')).toBeInTheDocument();

    // Check for the second successful result
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('This is the Gemini transcript.')).toBeInTheDocument();
  });

  it('displays the service name and error for failed results', () => {
    render(<ResultsDisplay results={mockResults} appStatus="success" healthStatus={mockHealthStatus} />);

    // Check for the failed result
    expect(screen.getByText('AssemblyAI')).toBeInTheDocument();
    expect(screen.getByText('Service timed out.')).toBeInTheDocument();
  });

  it('does not display anything if the app status is not "success"', () => {
    const { container } = render(<ResultsDisplay results={mockResults} appStatus="processing" healthStatus={mockHealthStatus} />);
    // The component should render loading skeletons, not the main content div
    expect(container.querySelector('.grid')).not.toBeNull(); // The grid for skeletons should exist
    expect(screen.queryByText('Transcription Results')).not.toBeInTheDocument();
  });
});
