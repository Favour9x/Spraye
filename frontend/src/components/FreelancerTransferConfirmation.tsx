'use client';

import { useState, useEffect } from 'react';

interface FreelancerTransferConfirmationProps {
  jobId: bigint;
  onConfirm: () => void;
}

export function FreelancerTransferConfirmation({ jobId, onConfirm }: FreelancerTransferConfirmationProps) {
  const [transferRequested, setTransferRequested] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [proofLink, setProofLink] = useState('');
  const [clientGithubUsername, setClientGithubUsername] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Poll for transfer state updates every 10 seconds
  useEffect(() => {
    const checkTransferState = () => {
      const transferData = localStorage.getItem(`transfer_request_${jobId}`);
      if (transferData) {
        try {
          const data = JSON.parse(transferData);
          setTransferRequested(data.requested || false);
          setTransferConfirmed(data.confirmed || false);
          setProofLink(data.proofLink || '');
        } catch (e) {
          console.error('Failed to parse transfer data:', e);
        }
      }
    };

    // Initial check
    checkTransferState();

    // Poll every 10 seconds
    const interval = setInterval(checkTransferState, 10000);

    return () => clearInterval(interval);
  }, [jobId]);

  // Load client GitHub username from job data
  useEffect(() => {
    const jobKeys = Object.keys(localStorage).filter(key => key.startsWith('job_github_'));
    for (const key of jobKeys) {
      try {
        const jobData = JSON.parse(localStorage.getItem(key) || '{}');
        if (jobData.githubUsername) {
          setClientGithubUsername(jobData.githubUsername);
          break;
        }
      } catch (e) {
        console.error('Failed to parse job data:', e);
      }
    }
  }, []);

  const handleConfirmTransfer = () => {
    if (!proofLink.trim()) return;

    // Update localStorage with confirmation
    const transferData = {
      requested: true,
      confirmed: true,
      proofLink: proofLink.trim(),
      confirmedAt: Date.now()
    };
    localStorage.setItem(`transfer_request_${jobId}`, JSON.stringify(transferData));

    setTransferConfirmed(true);
    setShowSuccess(true);
    
    // Trigger parent refresh to update UI
    onConfirm();
  };

  // If transfer not requested yet, show waiting message
  if (!transferRequested) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Waiting for Client Review</h3>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            Your work has been submitted. The client is reviewing your demo link. Once they request the GitHub repo transfer, you'll see instructions here.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This page automatically checks for updates every 10 seconds.
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
            <span className="font-semibold">✓ Transfer confirmed. The client has been notified.</span>
          </div>
          <div className="p-3 bg-white border border-green-300 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">Your proof link:</p>
            <a 
              href={proofLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {proofLink}
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
                {clientGithubUsername ? (
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
          disabled={!proofLink.trim()}
          className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${
            !proofLink.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0052FF] hover:bg-[#0046DD]'
          }`}
        >
          Confirm Transfer Sent
        </button>

        {showSuccess && (
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">✓ Transfer confirmed. The client has been notified.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
