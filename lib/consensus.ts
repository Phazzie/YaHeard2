import { JaroWinklerDistance } from 'natural';
import { TranscriptionResult } from './types';

// Helper to split text into sentences. A more robust NLP library could be used here in the future.
const getSentences = (text: string): string[] => {
  if (!text) return [];
  // A simple regex to split by sentence-ending punctuation.
  return text.match(/[^.!?]+[.!?]*/g) || [text];
};

/**
 * Generates a consensus transcript from multiple transcription results.
 * @param results An array of TranscriptionResult objects.
 * @returns A single string representing the consensus transcript.
 */
export function generateConsensus(results: TranscriptionResult[]): string {
  const successfulTranscripts = results
    .map(r => r.transcription)
    .filter((t): t is string => t !== null && t.length > 0);

  if (successfulTranscripts.length === 0) {
    return "No successful transcriptions were available to generate a consensus.";
  }
  if (successfulTranscripts.length === 1) {
    return successfulTranscripts[0];
  }

  const sentenceSets = successfulTranscripts.map(t => getSentences(t));
  const [baseSentences, ...otherSentenceSets] = sentenceSets;
  const consensusSentences: string[] = [];

  for (const baseSentence of baseSentences) {
    const candidateSentences = [baseSentence];

    // Find the best matching sentence from each of the other transcripts
    for (const otherSet of otherSentenceSets) {
      if (otherSet.length > 0) {
        let bestMatch = '';
        let bestScore = -1;
        for (const otherSentence of otherSet) {
          const score = JaroWinklerDistance(baseSentence, otherSentence, {});
          if (score > bestScore) {
            bestScore = score;
            bestMatch = otherSentence;
          }
        }
        // Only consider matches with a reasonable similarity score
        if (bestScore > 0.6) {
            candidateSentences.push(bestMatch);
        }
      }
    }

    // From the candidates, find the one that is most similar to all others in the group
    let bestCandidate = baseSentence;
    let highestTotalSimilarity = -1;

    for (const candidate of candidateSentences) {
        let totalSimilarity = 0;
        for (const other of candidateSentences) {
            if (candidate !== other) {
                totalSimilarity += JaroWinklerDistance(candidate, other, {});
            }
        }
        if (totalSimilarity > highestTotalSimilarity) {
            highestTotalSimilarity = totalSimilarity;
            bestCandidate = candidate;
        }
    }
    consensusSentences.push(bestCandidate);
  }

  return consensusSentences.join(' ').replace(/\s+/g, ' ').trim();
}
