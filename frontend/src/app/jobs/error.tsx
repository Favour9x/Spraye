'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('❌ Jobs page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-card rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
          <svg
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-400 mb-6">
          {error.message || 'An error occurred while loading the jobs page.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-3 bg-[#0052FF] text-white font-medium rounded-lg hover:bg-[#0046DD] transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="block w-full px-4 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go home
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg text-left">
          <p className="text-xs text-gray-500 mb-2">Debug info:</p>
          <pre className="text-xs text-gray-400 overflow-auto">
            {error.stack?.slice(0, 200)}...
          </pre>
        </div>
      </div>
    </div>
  );
}
