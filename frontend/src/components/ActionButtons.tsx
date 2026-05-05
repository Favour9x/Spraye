'use client';

import { useState } from 'react';
import { useApproveWork } from '@/lib/hooks/useApproveWork';
import { useRaiseDispute } from '@/lib/hooks/useRaiseDispute';
import { useResolveDispute } from '@/lib/hooks/useResolveDispute';
import { TxNotification } from './TxNotification';

interface ActionButtonsProps {
  jobId: bigint;
  role: 'client' | 'arbitrator' | 'none';
  state: 'SUBMITTED' | 'DISPUTED';
  onSuccess: () => void;
}

export function ActionButtons({ jobId, role, state, onSuccess }: ActionButtonsProps) {
  const { approveWork, status: approveStatus, txHash: approveTxHash, error: approveError } = useApproveWork();
  const { raiseDispute, status: disputeStatus, txHash: disputeTxHash, error: disputeError } = useRaiseDispute();
  const { resolveDispute, status: resolveStatus, txHash: resolveTxHash, error: resolveError } = useResolveDispute();

  const [activeAction, setActiveAction] = useState<'approve' | 'dispute' | 'resolve-freelancer' | 'resolve-client' | null>(null);

  const handleApprove = async () => {
    setActiveAction('approve');
    await approveWork(jobId);
    if (approveStatus === 'success') {
      onSuccess();
    }
  };

  const handleDispute = async () => {
    setActiveAction('dispute');
    await raiseDispute(jobId);
    if (disputeStatus === 'success') {
      onSuccess();
    }
  };

  const handleResolveFreelancer = async () => {
    setActiveAction('resolve-freelancer');
    await resolveDispute(jobId, true);
    if (resolveStatus === 'success') {
      onSuccess();
    }
  };

  const handleResolveClient = async () => {
    setActiveAction('resolve-client');
    await resolveDispute(jobId, false);
    if (resolveStatus === 'success') {
      onSuccess();
    }
  };

  const isDisabled = approveStatus === 'pending' || disputeStatus === 'pending' || resolveStatus === 'pending';

  // Client actions (SUBMITTED state)
  if (role === 'client' && state === 'SUBMITTED') {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
            }`}
          >
            {approveStatus === 'pending' && activeAction === 'approve' ? 'Approving...' : 'Approve Work'}
          </button>
          <button
            onClick={handleDispute}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {disputeStatus === 'pending' && activeAction === 'dispute' ? 'Raising...' : 'Raise Dispute'}
          </button>
        </div>

        {activeAction === 'approve' && <TxNotification status={approveStatus} txHash={approveTxHash} error={approveError} />}
        {activeAction === 'dispute' && <TxNotification status={disputeStatus} txHash={disputeTxHash} error={disputeError} />}
      </div>
    );
  }

  // Arbitrator actions (DISPUTED state)
  if (role === 'arbitrator' && state === 'DISPUTED') {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleResolveFreelancer}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
            }`}
          >
            {resolveStatus === 'pending' && activeAction === 'resolve-freelancer' ? 'Resolving...' : 'Resolve for Freelancer'}
          </button>
          <button
            onClick={handleResolveClient}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            {resolveStatus === 'pending' && activeAction === 'resolve-client' ? 'Resolving...' : 'Resolve for Client'}
          </button>
        </div>

        {(activeAction === 'resolve-freelancer' || activeAction === 'resolve-client') && (
          <TxNotification status={resolveStatus} txHash={resolveTxHash} error={resolveError} />
        )}
      </div>
    );
  }

  return null;
}
