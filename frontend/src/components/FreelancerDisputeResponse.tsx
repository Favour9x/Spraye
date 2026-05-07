'use client';

import { useState, useEffect } from 'react';

interface FreelancerDisputeResponseProps {
  jobId: bigint;
}

export function FreelancerDisputeResponse({ jobId }: FreelancerDisputeResponseProps) {
  const [response, setResponse] = useState('');
  const [transferProofLink, setTransferProofLink] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Check if already submitted
  useEffect(() => {
    const stored = localStorage.getItem(`freelancer_dispute_response_${jobId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setResponse(data.response || '');
        setTransferProofLink(data.transferProofLink || '');
        setSubmitted(true);
      } catch (e) {
        console.error('Failed to parse stored response:', e);
      }
    }
  }, [jobId]);

  const handleSubmit = () => {
    if (!response.trim() || !transferProofLink.trim()) {
      return;
    }

    // Store response in localStorage for reference
    localStorage.setItem(`freelancer_dispute_response_${jobId}`, JSON.stringify({
      response,
      transferProofLink,
      timestamp: Date.now()
    }));

    setSubmitted(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">The client has raised a dispute on this job</h4>
            <p className="text-sm text-gray-700">
              Submit your evidence below so the arbitrator can review your case.
            </p>
          </div>
        </div>
      </div>

      {!submitted ? (
        <>
          {/* Response Text Area */}
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Explain clearly how your delivered work matches the original job description"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-gray-900"
            />
          </div>

          {/* Transfer Proof Link */}
          <div>
            <label htmlFor="transferProof" className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Proof Link
            </label>
            <input
              type="url"
              id="transferProof"
              value={transferProofLink}
              onChange={(e) => setTransferProofLink(e.target.value)}
              placeholder="Go to imgur.com, upload your GitHub transfer confirmation screenshot, copy the link and paste it here"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              This link is your proof that you transferred the repo to the client. The arbitrator will use this as evidence in your favour.
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> If you delivered exactly what was agreed in the job description and transferred the repo, the arbitrator will rule in your favour.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || !transferProofLink.trim()}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg transition-colors ${
              !response.trim() || !transferProofLink.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#0052FF] hover:bg-[#0046DD]'
            }`}
          >
            Submit Evidence
          </button>
        </>
      ) : (
        <div className="p-6 bg-green-50 border-2 border-green-400 rounded-lg text-center">
          <svg className="w-12 h-12 text-green-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="font-semibold text-gray-900 mb-2">Evidence Submitted</h4>
          <p className="text-sm text-gray-700 mb-4">
            Your response and transfer proof have been recorded. The arbitrator will review all evidence and make a final decision.
          </p>
          
          <div className="text-left space-y-3 p-4 bg-white rounded-lg border border-green-300">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Your Response:</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{response}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Transfer Proof:</p>
              <a 
                href={transferProofLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {transferProofLink}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
