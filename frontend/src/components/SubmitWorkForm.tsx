'use client';

import { useState, useEffect } from 'react';
import { useSubmitWork } from '@/lib/hooks/useSubmitWork';
import { TxNotification } from './TxNotification';

interface SubmitWorkFormProps {
  jobId: bigint;
  jobDescription: string;
  jobClientAddress: string;
  onSuccess: () => void;
}

export function SubmitWorkForm({ jobId, jobDescription, jobClientAddress, onSuccess }: SubmitWorkFormProps) {
  const [deliverable, setDeliverable] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [clientGithubUsername, setClientGithubUsername] = useState<string>('');

  const { submitWork, status, txHash, error: txError } = useSubmitWork();

  // Retrieve client's GitHub username from localStorage using client address and job description
  useEffect(() => {
    const storageKey = `job_github_${jobClientAddress.toLowerCase()}_${jobDescription.substring(0, 50)}`;
    console.log('🔍 Looking for GitHub username with key:', storageKey);
    
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      try {
        const jobData = JSON.parse(storedData);
        console.log('✅ Found GitHub username:', jobData.githubUsername);
        setClientGithubUsername(jobData.githubUsername || '');
      } catch (e) {
        console.error('Failed to parse job data:', e);
      }
    } else {
      console.log('❌ No GitHub username found for this job');
    }
  }, [jobDescription, jobClientAddress]);

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
      {/* Client GitHub Username Display */}
      {clientGithubUsername && (
        <div className="p-4 bg-blue-900/20 border-2 border-blue-500 rounded-lg">
          <p className="text-sm font-medium text-gray-300 mb-1">Client GitHub Username:</p>
          <p className="text-xl font-bold text-blue-400">@{clientGithubUsername}</p>
          <p className="text-xs text-gray-400 mt-2">
            Use this username when transferring the GitHub repo after the client requests it.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="deliverable" className="block text-sm font-medium text-gray-300 mb-2">
          Deliverable (Demo Link, Repo Link, Notes)
        </label>
        <textarea
          id="deliverable"
          value={deliverable}
          onChange={(e) => setDeliverable(e.target.value)}
          placeholder="Demo: https://...\nRepo: https://github.com/...\nNotes: ..."
          rows={6}
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

      {/* Transfer Instructions */}
      <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3">
        <h4 className="font-semibold text-white text-sm mb-2">📋 Submission & Transfer Instructions</h4>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="font-bold text-[#0052FF]">1.</span>
            <span>Submit your live demo link and GitHub repo link in the field above</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#0052FF]">2.</span>
            <span>Wait for the client to review your demo before doing anything else</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#0052FF]">3.</span>
            <span>When the client requests the repo transfer, go to your GitHub repo → Settings → Danger Zone → Transfer Ownership → type the client GitHub username shown above</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#0052FF]">4.</span>
            <span>After transferring, go to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">imgur.com</a> → New Post → upload your transfer confirmation screenshot → copy the image link → keep it safe. You will need it if a dispute is raised.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-yellow-400">⚠️</span>
            <span className="text-yellow-400">Important: The job description is the source of truth in any dispute. Deliver exactly what was agreed in the original job post to protect yourself.</span>
          </li>
        </ol>
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
