
import React from 'react';
import { CloseIcon } from './icons.tsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isConfirming?: boolean;
  error?: string | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Konfirmasi',
  cancelButtonText = 'Batal',
  isConfirming = false,
  error = null,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out"
      aria-modal="true"
      role="dialog"
      onClick={isConfirming ? undefined : onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <button
            onClick={isConfirming ? undefined : onClose}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Tutup modal"
            disabled={isConfirming}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            <p className="font-medium">Terjadi Kesalahan:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="text-sm text-text-secondary mb-6">{message}</div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger disabled:opacity-50 disabled:bg-danger/70 flex items-center"
          >
            {isConfirming && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isConfirming ? 'Memproses...' : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
