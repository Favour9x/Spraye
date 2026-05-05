'use client';

import { use } from 'react';
import { useFreelancerProfile } from '@/lib/hooks/useFreelancerProfile';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { formatAddress } from '@/lib/utils';
import Link from 'next/link';

export default function FreelancerPublicProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { profile } = useFreelancerProfile(address as `0x${string}`);
  const { count } = useJobCount();

  // Get completed jobs for this freelancer
  const completedJobs: number[] = [];
  for (let i = 0; i < Number(count || 0); i++) {
    completedJobs.push(i);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Freelancer Profile</h1>
          <p className="text-gray-400 font-mono">{formatAddress(address)}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills listed</p>
              ) : (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded-full text-sm border border-[#0052FF]/30"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {completedJobs.filter(id => {
                  const { job } = useJob(BigInt(id));
                  return job && job.freelancer.toLowerCase() === address.toLowerCase() && (job.state === 3 || job.state === 5);
                }).length}
              </p>
              <p className="text-sm text-gray-400">Completed Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-gray-400">Reputation Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-black border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Work History</h3>
          <div className="space-y-3">
            {completedJobs.length === 0 ? (
              <p className="text-gray-500 text-sm">No completed jobs yet</p>
            ) : (
              completedJobs.slice(0, 10).map((jobId) => (
                <CompletedJobCard key={jobId} jobId={BigInt(jobId)} freelancerAddress={address} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedJobCard({ jobId, freelancerAddress }: { jobId: bigint; freelancerAddress: string }) {
  const { job } = useJob(jobId);

  if (!job || job.freelancer.toLowerCase() !== freelancerAddress.toLowerCase()) {
    return null;
  }

  if (job.state !== 3 && job.state !== 5) { // APPROVED or RESOLVED
    return null;
  }

  return (
    <Link
      href={`/jobs/${jobId}`}
      className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-[#0052FF]/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">Job #{jobId.toString()}</h4>
          <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {job.requiredSkills.map((skill: string) => (
              <span
                key={skill}
                className="px-2 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded text-xs border border-[#0052FF]/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <span className="ml-4 px-2 py-1 bg-green-900/30 text-green-300 border border-green-700 rounded text-xs">
          Completed
        </span>
      </div>
    </Link>
  );
}
