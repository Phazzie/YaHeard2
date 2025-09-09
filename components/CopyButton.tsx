'use client';

import { useState } from 'react';
import { useToasts } from '@/contexts/ToastContext';

interface CopyButtonProps {
  textToCopy: string;
}

export default function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { addToast } = useToasts();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      addToast('Copied to clipboard!', 'success');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Keep visual feedback on button
    } catch (err) {
      addToast('Failed to copy text.', 'error');
      console.error('Failed to copy text: ', err);
    }
  };

  const Icon = () => (
    isCopied ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  );

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-md transition-colors duration-200 ${isCopied ? 'bg-green-600/50 text-white' : 'bg-gray-600/50 hover:bg-gray-500/50 text-gray-300'}`}
      aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
      title={isCopied ? 'Copied!' : 'Copy to clipboard'}
    >
      <Icon />
    </button>
  );
}
