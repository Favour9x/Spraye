'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUsdc, jobStateToLabel, STATE_COLORS, type Job } from '@/lib/utils';
import { ESCROW_CONTRACT } from '@/lib/contracts';
import { SubmitWorkForm } from './SubmitWorkForm';
import { ActionButtons } from './ActionButtons';
import { ApplyForJobForm } from './ApplyForJobForm';
import { ApplicationsList } from './ApplicationsList';
import { FreelancerDisputeResponse } from './FreelancerDisputeResponse';
import { FreelancerTransferConfirmation } from './FreelancerTransferConfirmation';

interface JobDetailProps {
  job: Job;
  onRefresh: () => void;
}

export function JobDetail({ job, onRefresh }: JobDetailProps) {
  const { address } = useAccount();

  // Get arbitrator address
  const { data: arbitratorAddress } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'arbitrator',
  });

  const stateLabel = jobStateToLabel(job.state);
  const stateColor = STATE_COLORS[stateLabel];

  // Determine user role
  const isClient = address?.toLowerCase() === job.client.toLowerCase();
  const isFreelancer = job.freelancer !== '0x0000000000000000000000000000000000000000' && 
                       address?.toLowerCase() === job.freelancer.toLowerCase();
  const isArbitrator = address?.toLowerCase() === (arbitratorAddress as string)?.toLowerCase();

  const role = isClient ? 'client' : isFreelancer ? 'freelancer' : isArbitrator ? 'arbitrator' : 'observer';

  // Debug logging for troubleshooting
  console.log('🔍 JobDetail Debug:', {
    jobId: job.id.toString(),
    stateLabel,
    isClient,
    isFreelancer,
    isArbitrator,
    role,
    connectedAddress: address,
    freelancerAddress: job.freelancer,
    shouldShowTransferComponent: isFreelancer && (stateLabel === 'SUBMITTED' || stateLabel === 'TRANSFER_REQUESTED')
  });

  return (
    <div className="space-y-6">
      {/* Persistent Info Notice for Active Jobs */}
      {(stateLabel === 'ASSIGNED' || stateLabel === 'SUBMITTED' || stateLabel === 'TRANSFER_REQUESTED' || stateLabel === 'DISPUTED') && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900">Important Information</p>
              <ul className="space-y-1 text-gray-700">
                <li>• The original job description is the source of truth for all disputes on ArcHire.</li>
                <li>• <strong>Clients:</strong> do not approve until you have received and verified the GitHub repo transfer.</li>
                <li>• <strong>Freelancers:</strong> upload your transfer confirmation screenshot to imgur.com and save the link as proof before the job is marked complete.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Job Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job #{job.id.toString()}</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatUsdc(job.amount)}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full border ${stateColor}`}>
            {stateLabel}
          </span>
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Required Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
          <div>
            <span className="text-gray-500">Client:</span>
            <p className="font-mono text-gray-900 mt-1">{job.client}</p>
            {isClient && <span className="text-xs text-blue-600 font-medium">(You)</span>}
          </div>
          <div>
            <span className="text-gray-500">Freelancer:</span>
            <p className="font-mono text-gray-900 mt-1">
              {job.freelancer === '0x0000000000000000000000000000000000000000' 
                ? 'Not assigned yet' 
                : job.freelancer}
            </p>
            {isFreelancer && <span className="text-xs text-blue-600 font-medium">(You)</span>}
          </div>
        </div>

        {job.deliverable && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Deliverable:</span>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap break-words">
              {job.deliverable}
            </p>
          </div>
        )}

        {/* Application Count */}
        {stateLabel === 'OPEN' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {job.applicationCount.toString()} {job.applicationCount === BigInt(1) ? 'application' : 'applications'}
            </span>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {role !== 'observer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Your role:</span> {role.charAt(0).toUpperCase() + role.slice(1)}
          </p>
        </div>
      )}

      {/* Apply for Job Form (Non-client, OPEN state) */}
      {!isClient && stateLabel === 'OPEN' && address && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Job</h3>
          <ApplyForJobForm jobId={job.id} onSuccess={onRefresh} />
        </div>
      )}

      {/* Applications List (Client, OPEN state) */}
      {isClient && stateLabel === 'OPEN' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications</h3>
          <ApplicationsList jobId={job.id} onAssign={onRefresh} />
        </div>
      )}

      {/* Submit Work Form (Freelancer, ASSIGNED state) */}
      {isFreelancer && stateLabel === 'ASSIGNED' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Work</h3>
          <SubmitWorkForm jobId={job.id} jobDescription={job.description} onSuccess={onRefresh} />
        </div>
      )}

      {/* Freelancer Transfer Confirmation (SUBMITTED or TRANSFER_REQUESTED state) */}
      {isFreelancer && (stateLabel === 'SUBMITTED' || stateLabel === 'TRANSFER_REQUESTED') && (
        <FreelancerTransferConfirmation jobId={job.id} onConfirm={onRefresh} />
      )}

      {/* DEBUG: Force show component if not showing */}
      {!isFreelancer && stateLabel === 'SUBMITTED' && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
          <p className="text-red-800 font-bold">⚠️ DEBUG: Component not showing because:</p>
          <p className="text-sm text-red-700 mt-2">isFreelancer = {isFreelancer ? 'true' : 'false'}</p>
          <p className="text-sm text-red-700">Connected wallet: {address || 'Not connected'}</p>
          <p className="text-sm text-red-700">Freelancer address: {job.freelancer}</p>
          <p className="text-sm text-red-700">Match: {address?.toLowerCase() === job.freelancer.toLowerCase() ? 'YES' : 'NO'}</p>
        </div>
      )}

      {/* Freelancer Dispute Response (DISPUTED state) */}
      {isFreelancer && stateLabel === 'DISPUTED' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispute Raised</h3>
          <FreelancerDisputeResponse jobId={job.id} />
        </div>
      )}

      {/* Action Buttons (Client or Arbitrator) */}
      {((isClient && (stateLabel === 'SUBMITTED' || stateLabel === 'TRANSFER_REQUESTED')) || (isArbitrator && stateLabel === 'DISPUTED')) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isClient ? 'Review Work' : 'Resolve Dispute'}
          </h3>
          <ActionButtons
            jobId={job.id}
            role={isClient ? 'client' : 'arbitrator'}
            state={stateLabel as 'SUBMITTED' | 'TRANSFER_REQUESTED' | 'DISPUTED'}
            onSuccess={onRefresh}
          />
        </div>
      )}

      {/* Observer Message */}
      {role === 'observer' && stateLabel !== 'OPEN' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            You are viewing this job as an observer. Only the client, freelancer, or arbitrator can take actions.
          </p>
        </div>
      )}
    </div>
  );
}
