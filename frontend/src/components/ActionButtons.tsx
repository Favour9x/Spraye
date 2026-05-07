'use client';

import { useState, useEffect } from 'react';
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
  
  // Transfer request state
  const [transferRequested, setTransferRequested] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [transferProofLink, setTransferProofLink] = useState('');
  
  // Dispute form state
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  // Load transfer state from localStorage
  useEffect(() => {
    const transferData = localStorage.getItem(`transfer_request_${jobId}`);
    if (transferData) {
      try {
        const data = JSON.parse(transferData);
        setTransferRequested(data.requested || false);
        setTransferConfirmed(data.confirmed || false);
        setTransferProofLink(data.proofLink || '');
        
        // Auto-check checkboxes based on transfer state
        if (data.requested) {
          setCheckedContact(true);
        }
        if (data.confirmed) {
          setCheckedTransfer(true);
        }
      } catch (e) {
        console.error('Failed to parse transfer data:', e);
      }
    }
  }, [jobId]);
  
  const allChecked = checkedDemo && checkedContact && checkedTransfer;

  const handleRequestTransfer = () => {
    setTransferRequested(true);
    setCheckedContact(true);
    
    // Store in localStorage
    localStorage.setItem(`transfer_request_${jobId}`, JSON.stringify({
      requested: true,
      confirmed: false,
      proofLink: '',
      requestedAt: Date.now()
    }));
  };

  const handleApprove = async () => {
    setActiveAction('approve');
    await approveWork(jobId);
    if (approveStatus === 'success') {
      onSuccess();
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      return;
    }
    
    localStorage.setItem(`dispute_reason_${jobId}`, JSON.stringify({
      reason: disputeReason,
      timestamp: Date.now()
    }));
    
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
        {!showDisputeForm ? (
          <>
            {/* Step 1 - Request Repo Transfer */}
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Step 1 — Request Repo Transfer</h4>
              
              {!transferRequested ? (
                <button
                  onClick={handleRequestTransfer}
                  className="w-full px-4 py-2 bg-[#0052FF] text-white font-medium rounded-lg hover:bg-[#0046DD] transition-colors"
                >
                  Request Repo Transfer from Freelancer
                </button>
              ) : !transferConfirmed ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">✓ Transfer Requested — waiting for freelancer to confirm</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">✓ Freelancer has confirmed the repo transfer</span>
                  </div>
                  <div className="p-3 bg-white border border-blue-300 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <a 
                        href={transferProofLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View Transfer Proof →
                      </a>
                    </p>
                    <p className="text-xs text-gray-600">
                      Click the proof link above to verify the transfer in your GitHub account before approving
                    </p>
                  </div>
                </div>
              )}
            </div>

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
                  onChange={(e) => !transferRequested && setCheckedContact(e.target.checked)}
                  disabled={transferRequested}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0052FF] focus:ring-[#0052FF] disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  I have contacted the freelancer and requested the GitHub repo transfer
                  {transferRequested && <span className="text-green-600 ml-1">(auto-checked)</span>}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checkedTransfer}
                  onChange={(e) => !transferConfirmed && setCheckedTransfer(e.target.checked)}
                  disabled={transferConfirmed}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0052FF] focus:ring-[#0052FF] disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  I have received the repo transfer and verified it in my GitHub account
                  {transferConfirmed && <span className="text-green-600 ml-1">(auto-checked)</span>}
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
                  onClick={() => setShowDisputeForm(true)}
                  disabled={isDisabled}
                  className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    isDisabled ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Raise Dispute
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Click this if the delivered work does not match the original job description, or if the freelancer has not transferred the GitHub repo after being asked.
                </p>
              </div>
            </div>

            {activeAction === 'approve' && <TxNotification status={approveStatus} txHash={approveTxHash} error={approveError} />}
          </>
        ) : (
          <>
            {/* Dispute Form */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">You are raising a dispute</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    The arbitrator will review the original job description, the submitted work links, and your reason below. Please be specific.
                  </p>
                  
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe clearly how the delivered work does not match what was agreed in the job description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  />
                  
                  <p className="text-sm text-gray-700 mt-3 mb-2">
                    Possible outcomes: Full payment to the freelancer, or full refund to you — based on the arbitrator's review of the evidence.
                  </p>
                  
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Important: Raising a false dispute after already receiving the GitHub repo transfer is a violation of ArcHire terms and will be reviewed by the arbitrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDisputeForm(false)}
                disabled={isDisabled}
                className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                disabled={isDisabled || !disputeReason.trim()}
                className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                  isDisabled || !disputeReason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {disputeStatus === 'pending' && activeAction === 'dispute' ? 'Raising Dispute...' : 'Confirm Dispute'}
              </button>
            </div>

            {activeAction === 'dispute' && <TxNotification status={disputeStatus} txHash={disputeTxHash} error={disputeError} />}
          </>
        )}
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
