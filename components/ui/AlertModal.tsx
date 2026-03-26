import React from 'react';

interface AlertModalProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertModal({ message, type, isOpen, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const typeClasses = {
    success: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
        </svg>
      ),
      text: 'text-green-600',
      bg: 'text-green-900',
    },
    error: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
        </svg>
      ),
      text: 'text-red-600',
      bg: 'text-red-900',
    },
    info: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
        </svg>
      ),
      text: 'text-blue-600',
      bg: 'text-blue-900',
    },
  };

  const { icon, text, bg } = typeClasses[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
        <div className={`flex items-center gap-3 mb-4 ${text}`}>
          {icon}
          <p className={`font-medium ${bg}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
