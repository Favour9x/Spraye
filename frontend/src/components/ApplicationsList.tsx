'use client';

import { useApplicants } from '@/lib/hooks/useApplicants';
import { useApplication } from '@/lib/hooks/useApplication';
import { useAssignFreelancer } from '@/lib/hooks/useAssignFreelancer';
import { formatAddress } from '@/lib/utils';
import { TxNotification } from './TxNotification';
import { useState } from 'react';

interface ApplicationsListProps {
  jobId: bigint;
  onAssign: () => void;
}

function ApplicationCard({ 
  jobId, 
  freelancer, 
  onAssign 
}: { 
  jobId: bigint; 
  freelancer: `0x${string}`; 
  onAssign: () => void;
}) {
  const { application, isLoading } = useApplication(jobId, freelancer);
  const { assignFreelancer, status, txHash, error } = useAssignFreelancer();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAssign = async () => {
    await assignFreelancer(jobId, freelancer);
    if (status === 'success') {
      onAssign();
    }
  };

  if (isLoading || !application) {
    return (
      <div className="border border-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-800 rounded w-2/3"></div>
      </div>
    );
  }

  const timestamp = new Date(Number(application.timestamp) * 1000);

  return (
    <div className="border border-gray-800 rounded-lg p-4 hover:border-[#0052FF] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-mono text-sm text-white">{freelancer}</p>
          <p className="text-xs text-gray-500 mt-1">
            Applied {timestamp.toLocaleDateString()} at {timestamp.toLocaleTimeString()}
          </p>
          {/* Show estimated delivery time */}
          {application.estimatedDelivery && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-500 rounded-lg">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-400">
                Estimated Delivery: {application.estimatedDelivery}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleAssign}
          disabled={status === 'pending'}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            status === 'pending'
              ? 'bg-gray-700 text-white cursor-not-allowed'
              : 'bg-[#0052FF] text-white hover:bg-[#0046DD]'
          }`}
        >
          {status === 'pending' ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[#0052FF] hover:text-[#0046DD] font-medium"
        >
          {isExpanded ? 'Hide' : 'View'} Proposal
        </button>
        {isExpanded && (
          <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap bg-black border border-gray-800 p-3 rounded">
            {application.proposal}
          </p>
        )}
      </div>

      {(status === 'pending' || status === 'success' || status === 'error') && (
        <div className="mt-3">
          <TxNotification status={status} txHash={txHash} error={error} />
        </div>
      )}
    </div>
  );
}

export function ApplicationsList({ jobId, onAssign }: ApplicationsListProps) {
  const { applicants, isLoading, error } = useApplicants(jobId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading applications</p>
      </div>
    );
  }

  if (!applicants || applicants.length === 0) {
    return (
      <div className="text-center py-8 bg-black border border-gray-800 rounded-lg">
        <p className="text-gray-300">No applications yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Freelancers can apply for this job to be considered
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((freelancer) => (
        <ApplicationCard
          key={freelancer}
          jobId={jobId}
          freelancer={freelancer}
          onAssign={onAssign}
        />
      ))}
    </div>
  );
}
