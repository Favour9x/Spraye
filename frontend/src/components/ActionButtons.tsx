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
  
  // Checklist state for client approval
  const [checkedDemo, setCheckedDemo] = useState(false);
  const [checkedContact, setCheckedContact] = useState(false);
  const [checkedTransfer, setCheckedTransfer] = useState(false);
  
  const allChecked = checkedDemo && checkedContact && checkedTransfer;

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
        {/* Approval Checklist */}
        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Before you proceed, please confirm all of the following:</h4>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedDemo}
              onChange={(e) => setCheckedDemo(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0052FF] focus:ring-[#0052FF]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I have reviewed the live demo link submitted by the freelancer
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedContact}
              onChange={(e) => setCheckedContact(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0052FF] focus:ring-[#0052FF]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I have contacted the freelancer and requested the GitHub repo transfer
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checkedTransfer}
              onChange={(e) => setCheckedTransfer(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0052FF] focus:ring-[#0052FF]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I have received the repo transfer and verified it in my GitHub account
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <button
              onClick={handleApprove}
              disabled={isDisabled || !allChecked}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                isDisabled || !allChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
              }`}
            >
              {approveStatus === 'pending' && activeAction === 'approve' ? 'Approving...' : 'Approve Work'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Clicking Approve permanently releases the USDC escrow to the freelancer. This cannot be undone.
            </p>
          </div>
          
          <div className="flex-1">
            <button
              onClick={handleDispute}
              disabled={isDisabled}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {disputeStatus === 'pending' && activeAction === 'dispute' ? 'Raising...' : 'Raise Dispute'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Click this if the delivered work does not match the original job description, or if the freelancer has not transferred the GitHub repo after being asked.
            </p>
          </div>
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
