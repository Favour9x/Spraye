'use client';

import { EXPLORER_URL } from '@/constants';

interface TxNotificationProps {
  status: 'idle' | 'pending' | 'success' | 'error' | 'approving' | 'checking';
  txHash?: `0x${string}` | null;
  error?: string | null;
}

export function TxNotification({ status, txHash, error }: TxNotificationProps) {
  if (status === 'idle') return null;

  if (status === 'checking') {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm text-blue-800">Checking allowance...</span>
        </div>
      </div>
    );
  }

  if (status === 'approving') {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm text-blue-800">Approving USDC... Confirm in your wallet</span>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">Transaction pending...</p>
            {txHash && (
              <a
                href={`${EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-green-800 font-medium">Transaction confirmed!</p>
            {txHash && (
              <a
                href={`${EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error' && error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Transaction failed</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
