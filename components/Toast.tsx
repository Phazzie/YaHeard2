'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onClose: (id: number) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const baseStyle = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center justify-between';
  const typeStyles = {
    success: 'bg-green-600/80 backdrop-blur-sm border border-green-500',
    error: 'bg-red-600/80 backdrop-blur-sm border border-red-500',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span>{message}</span>
      <button onClick={() => onClose(id)} className="ml-4 text-xl font-bold">&times;</button>
    </div>
  );
}
