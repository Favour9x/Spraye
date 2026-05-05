'use client';

import { useState } from 'react';
import { useSubmitWork } from '@/lib/hooks/useSubmitWork';
import { TxNotification } from './TxNotification';

interface SubmitWorkFormProps {
  jobId: bigint;
  onSuccess: () => void;
}

export function SubmitWorkForm({ jobId, onSuccess }: SubmitWorkFormProps) {
  const [deliverable, setDeliverable] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { submitWork, status, txHash, error: txError } = useSubmitWork();

  const validate = (): boolean => {
    if (!deliverable.trim()) {
      setError('Deliverable is required');
      return false;
    }
    if (deliverable.length > 2048) {
      setError('Deliverable must be 2048 characters or less');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await submitWork(jobId, deliverable);
    if (status === 'success') {
      onSuccess();
    }
  };

  const isDisabled = status === 'pending';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="deliverable" className="block text-sm font-medium text-gray-300 mb-2">
          Deliverable (URL or description)
        </label>
        <textarea
          id="deliverable"
          value={deliverable}
          onChange={(e) => setDeliverable(e.target.value)}
          placeholder="https://... or describe your completed work"
          rows={4}
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            error ? 'border-red-500' : 'border-gray-700'
          } ${isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        <p className="mt-1 text-xs text-gray-500">
          {deliverable.length} / 2048 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
          isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
        }`}
      >
        {status === 'pending' ? 'Submitting...' : 'Submit Work'}
      </button>

      <TxNotification status={status} txHash={txHash} error={txError} />
    </form>
  );
}
