'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { ESCROW_CONTRACT } from '@/lib/contracts';
import { useGithubUsername } from '@/lib/hooks/useGithubUsername';
import { useConfirmTransfer } from '@/lib/hooks/useConfirmTransfer';

interface FreelancerTransferConfirmationProps {
  jobId: bigint;
  jobDescription: string;
  jobClientAddress: string;
  onConfirm: () => void;
}

export function FreelancerTransferConfirmation({ jobId, jobDescription, jobClientAddress, onConfirm }: FreelancerTransferConfirmationProps) {
  const [proofLink, setProofLink] = useState('');

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch GitHub username from contract
  const { githubUsername: clientGithubUsername, isLoading: loadingGithub } = useGithubUsername(jobId);

  // Use confirmTransfer hook
  const { confirmTransfer, status, error, isConfirming, isConfirmed } = useConfirmTransfer();

  // Read job state from blockchain with aggressive refetching
  const { data: job, isError, isLoading, error: jobError, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'getJob',
    args: [jobId],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds (more aggressive)
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Always refetch on mount
      staleTime: 0, // Consider data stale immediately
    }
  });

  // Read transfer proof link from contract
  const { data: contractProofLink } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'transferProofLinks',
    args: [jobId],
    query: {
      refetchInterval: 5000, // Check every 5 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  });

  // Check if transfer was confirmed onchain
  const transferConfirmed = contractProofLink && contractProofLink.trim() !== '';

  // Force cache invalidation on component mount to ensure fresh data
  useEffect(() => {
    console.log('🔄 FreelancerTransferConfirmation: Invalidating cache on mount for jobId:', jobId.toString());
    queryClient.invalidateQueries({ 
      queryKey: [{ ...ESCROW_CONTRACT, functionName: 'getJob', args: [jobId] }] 
    });
  }, [jobId, queryClient]);

  // Monitor job state changes and log transitions
  useEffect(() => {
    if (job) {
      console.log('📊 FreelancerTransferConfirmation: Job state changed:', {
        jobId: jobId.toString(),
        currentState: job.state,
        stateLabel: ['OPEN', 'ASSIGNED', 'SUBMITTED', 'TRANSFER_REQUESTED', 'APPROVED', 'DISPUTED', 'RESOLVED'][job.state],
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [job?.state, jobId]);

  // Handle confirm transfer button click
  const handleConfirmTransfer = async () => {
    if (!proofLink.trim()) return;

    await confirmTransfer(jobId, proofLink.trim());
  };

  // Trigger parent refresh when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      onConfirm();
    }
  }, [isConfirmed, onConfirm]);

  // Check if job state is TRANSFER_REQUESTED (state === 3)
  const transferRequested = job && job.state === 3;

  // Debug logging with error handling
  useEffect(() => {
    console.log('🔍 FreelancerTransferConfirmation Debug:', {
      jobId: jobId.toString(),
      isLoading,
      isError,
      error: jobError?.message,
      jobData: job ? {
        currentState: job.state,
        stateLabel: ['OPEN', 'ASSIGNED', 'SUBMITTED', 'TRANSFER_REQUESTED', 'APPROVED', 'DISPUTED', 'RESOLVED'][job.state],
        transferRequested,
      } : 'No data',
      contractProofLink: contractProofLink || 'empty',
      transferConfirmed,
      timestamp: new Date().toLocaleTimeString(),
      cacheStatus: 'Query executed'
    });
  }, [job, jobId, transferRequested, isLoading, isError, jobError, contractProofLink, transferConfirmed]);

  // If transfer not requested yet, show waiting message
  if (!transferRequested) {
    // Manual refresh handler using React Query cache invalidation
    const handleManualRefresh = async () => {
      console.log('🔄 Manual refresh triggered - invalidating cache and refetching');
      await queryClient.invalidateQueries({ 
        queryKey: [{ ...ESCROW_CONTRACT, functionName: 'getJob', args: [jobId] }] 
      });
      await refetch();
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Waiting for Client Review</h3>
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            Your work has been submitted. The client is reviewing your demo link. Once they request the GitHub repo transfer, you'll see instructions here.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This page automatically checks for updates every 10 seconds. If the client has already requested the transfer, click the Refresh button above.
          </p>
        </div>
      </div>
    );
  }

  // If already confirmed, show success message
  if (transferConfirmed) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Confirmed</h3>
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">✓ Transfer confirmation sent to client. They will see your proof link shortly.</span>
          </div>
          <div className="p-3 bg-white border border-green-300 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">Your proof link:</p>
            <a 
              href={contractProofLink as string} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {contractProofLink}
            </a>
          </div>
          <p className="text-sm text-gray-700">
            The client will verify the transfer and approve the work. Payment will be released to your wallet within 2-5 seconds after approval.
          </p>
        </div>
      </div>
    );
  }

  // Show transfer request form
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Repo Transfer Requested</h3>
      
      <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-2">
              The client has reviewed your work and is requesting the GitHub repo transfer. Please follow the steps below:
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Transfer Instructions:</h4>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-[#0052FF]">1.</span>
              <span>Go to your GitHub repo → <strong>Settings</strong> → <strong>Danger Zone</strong> → <strong>Transfer Ownership</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0052FF]">2.</span>
              <div className="flex-1">
                <span>Enter the client GitHub username shown below:</span>
                {loadingGithub ? (
                  <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600">Loading GitHub username...</p>
                  </div>
                ) : clientGithubUsername && clientGithubUsername.trim() !== '' ? (
                  <div className="mt-2 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Client GitHub Username:</p>
                    <p className="text-xl font-bold text-blue-600">@{clientGithubUsername}</p>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Client GitHub username not provided. Please contact the client to get their GitHub username before transferring.
                    </p>
                  </div>
                )}
              </div>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0052FF]">3.</span>
              <span>After transferring, go to <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">imgur.com</a> → <strong>New Post</strong> → upload your transfer confirmation screenshot → copy the image link</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-[#0052FF]">4.</span>
              <span>Paste the imgur link in the field below and click <strong>Confirm Transfer Sent</strong></span>
            </li>
          </ol>
        </div>

        <div>
          <label htmlFor="proofLink" className="block text-sm font-medium text-gray-700 mb-2">
            Transfer Confirmation Link
          </label>
          <input
            id="proofLink"
            type="url"
            value={proofLink}
            onChange={(e) => setProofLink(e.target.value)}
            placeholder="Paste your imgur.com screenshot link here as proof of transfer"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: https://imgur.com/a/abc123
          </p>
        </div>

        <button
          onClick={handleConfirmTransfer}
          disabled={!proofLink.trim() || isConfirming}
          className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
            !proofLink.trim() || isConfirming ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
          }`}
        >
          {isConfirming ? 'Confirming Transaction...' : 'Confirm Transfer Sent'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">✓ Transfer confirmation sent to client. They will see your proof link shortly.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
