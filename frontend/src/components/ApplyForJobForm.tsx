'use client';

import { useState } from 'react';
import { useApplyForJob } from '@/lib/hooks/useApplyForJob';
import { TxNotification } from './TxNotification';

interface ApplyForJobFormProps {
  jobId: bigint;
  onSuccess: () => void;
}

export function ApplyForJobForm({ jobId, onSuccess }: ApplyForJobFormProps) {
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { applyForJob, status, txHash, error: contractError } = useApplyForJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposal.trim()) {
      setError('Proposal is required');
      return;
    }

    setError(null);
    await applyForJob(jobId, proposal);

    if (status === 'success') {
      setProposal('');
      onSuccess();
    }
  };

  const isDisabled = status === 'pending';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="proposal" className="block text-sm font-medium text-gray-300 mb-2">
          Why are you a good fit for this job?
        </label>
        <textarea
          id="proposal"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Explain your relevant experience and why you should be selected..."
          rows={4}
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            error ? 'border-red-500' : 'border-gray-700'
          } ${isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full px-4 py-3 text-white font-medium rounded-lg transition-colors ${
          isDisabled
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-[#0052FF] hover:bg-[#0046DD]'
        }`}
      >
        {status === 'pending' ? 'Submitting Application...' : 'Apply for Job'}
      </button>

      <TxNotification status={status} txHash={txHash} error={contractError} />
    </form>
  );
}
