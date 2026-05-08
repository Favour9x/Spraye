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
  const [estimatedDelivery, setEstimatedDelivery] = useState('1 week'); // Default value
  const [error, setError] = useState<string | null>(null);

  const { applyForJob, status, txHash, error: contractError } = useApplyForJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposal.trim()) {
      setError('Proposal is required');
      return;
    }

    if (!estimatedDelivery) {
      setError('Estimated delivery time is required');
      return;
    }

    setError(null);
    await applyForJob(jobId, proposal, estimatedDelivery);

    if (status === 'success') {
      setProposal('');
      setEstimatedDelivery('1 week');
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

      <div>
        <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-300 mb-2">
          Estimated Delivery Time <span className="text-red-400">*</span>
        </label>
        <select
          id="estimatedDelivery"
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.target.value)}
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''
          }`}
        >
          <option value="1 day">1 day</option>
          <option value="3 days">3 days</option>
          <option value="1 week">1 week</option>
          <option value="2 weeks">2 weeks</option>
          <option value="1 month">1 month</option>
          <option value="More than 1 month">More than 1 month</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          How long will it take you to complete this project?
        </p>
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
