'use client';

import CopyButton from './CopyButton';

interface ConsensusDisplayProps {
  consensusText: string;
}

export default function ConsensusDisplay({ consensusText }: ConsensusDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-8">
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
          Consensus Transcript
        </h2>
        <div className="absolute right-0">
          <CopyButton textToCopy={consensusText} />
        </div>
      </div>
      <div className="bg-white/10 rounded-xl p-6 shadow-2xl border border-white/20">
        <p className="text-lg text-gray-200 whitespace-pre-wrap leading-relaxed">
          {consensusText}
        </p>
      </div>
    </div>
  );
}
