'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { useResolveDispute } from '@/lib/hooks/useResolveDispute';
import { useSetPlatformFee } from '@/lib/hooks/useSetPlatformFee';
import { formatAddress, formatUsdc } from '@/lib/utils';
import { ARBITRATOR_ADDRESS } from '@/constants';
import { ESCROW_CONTRACT } from '@/lib/contracts';
import { useState, useEffect } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const PLATFORM_WALLET_ADDRESS = '0x06ca85E556d53bb2A54a99D8cA546Fe927beB689';

export default function ArbitratorPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { count } = useJobCount();
  const isArbitrator = address?.toLowerCase() === ARBITRATOR_ADDRESS.toLowerCase();
  const isPlatformWallet = address?.toLowerCase() === PLATFORM_WALLET_ADDRESS.toLowerCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to access the arbitrator dashboard</p>
        </div>
      </div>
    );
  }

  if (!isArbitrator) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You are not authorized to access the arbitrator dashboard</p>
          <p className="text-gray-500 text-sm mt-2">Arbitrator: {formatAddress(ARBITRATOR_ADDRESS)}</p>
        </div>
      </div>
    );
  }

  // Get all jobs from current contract and filter for disputed ones
  const disputedJobs: number[] = [];
  const totalJobs = Number(count || 0);
  
  for (let i = 0; i < totalJobs; i++) {
    disputedJobs.push(i);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Arbitrator Dashboard</h1>
          <p className="text-gray-400">Review and resolve disputed jobs</p>
          <p className="text-gray-500 text-sm mt-2">
            Contract: {ESCROW_CONTRACT.address} | Total Jobs: {totalJobs}
          </p>
        </div>

        {/* Platform Fee Adjustment (only for platform wallet) */}
        {isPlatformWallet && (
          <div className="mb-8">
            <PlatformFeeAdjustment />
          </div>
        )}

        {/* Disputed Jobs */}
        <div className="space-y-4">
          {disputedJobs.length === 0 ? (
            <div className="bg-black border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">No jobs found on this contract yet.</p>
              <p className="text-gray-500 text-sm mt-2">Disputed jobs will appear here when raised.</p>
            </div>
          ) : (
            disputedJobs.map((jobId) => (
              <DisputedJobCard key={jobId} jobId={BigInt(jobId)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DisputedJobCard({ jobId }: { jobId: bigint }) {
  const { job, refetch } = useJob(jobId);
  const { resolveDispute, status, error } = useResolveDispute();
  const [isResolving, setIsResolving] = useState(false);

  if (!job || job.state !== 4) { // Only show DISPUTED jobs
    return null;
  }

  const handleResolve = async (favorFreelancer: boolean) => {
    setIsResolving(true);
    try {
      await resolveDispute(jobId, favorFreelancer);
      await refetch();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-black border border-red-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">Job #{jobId.toString()}</h3>
            <span className="px-3 py-1 bg-red-900/30 text-red-300 border border-red-700 rounded-full text-sm">
              DISPUTED
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-4">{formatUsdc(job.amount)}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1">Job Description</h4>
          <p className="text-white">{job.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Client</h4>
            <p className="text-white font-mono">{formatAddress(job.client)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Freelancer</h4>
            <p className="text-white font-mono">{formatAddress(job.freelancer)}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill: string) => (
              <span
                key={skill}
                className="px-2 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded text-sm border border-[#0052FF]/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.deliverable && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Submitted Work</h4>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-white break-all">{job.deliverable}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resolution Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-800">
        <button
          onClick={() => handleResolve(true)}
          disabled={isResolving || status === 'pending'}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {status === 'pending' ? 'Resolving...' : 'Resolve for Freelancer'}
        </button>
        <button
          onClick={() => handleResolve(false)}
          disabled={isResolving || status === 'pending'}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {status === 'pending' ? 'Resolving...' : 'Resolve for Client'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-300 text-sm">Dispute resolved successfully!</p>
        </div>
      )}
    </div>
  );
}

function PlatformFeeAdjustment() {
  const [newFee, setNewFee] = useState<string>('');
  const { setPlatformFee, status, error, isConfirmed } = useSetPlatformFee();

  // Read current platform fee
  const { data: currentFee, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'platformFeePercent',
  });

  // Refetch when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setNewFee('');
    }
  }, [isConfirmed, refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const feeValue = parseInt(newFee);
    if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
      alert('Please enter a valid fee percentage between 0 and 100');
      return;
    }

    await setPlatformFee(feeValue);
  };

  return (
    <div className="bg-black border border-[#0052FF] rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Platform Fee Adjustment</h2>
      <p className="text-gray-400 mb-6">Only the platform wallet can adjust the platform fee percentage</p>

      {/* Current Fee Display */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Current Platform Fee</h3>
        <div className="text-3xl font-bold text-[#0052FF]">
          {currentFee !== undefined ? `${currentFee.toString()}%` : 'Loading...'}
        </div>
      </div>

      {/* Fee Adjustment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newFee" className="block text-sm font-medium text-gray-400 mb-2">
            New Fee Percentage (0-100)
          </label>
          <input
            type="number"
            id="newFee"
            min="0"
            max="100"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            placeholder="Enter new fee percentage"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0052FF]"
            disabled={status === 'pending'}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'pending' || !newFee}
          className="w-full px-6 py-3 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {status === 'pending' ? 'Updating...' : 'Update Platform Fee'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-300 text-sm">Platform fee updated successfully!</p>
        </div>
      )}
    </div>
  );
}
