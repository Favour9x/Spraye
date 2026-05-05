'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { formatAddress, formatUsdc, jobStateToLabel, STATE_COLORS } from '@/lib/utils';
import Link from 'next/link';

type TabType = 'posted' | 'applied' | 'working';

export default function MyJobsPage() {
  const { address, isConnected } = useAccount();
  const { count } = useJobCount();
  const [activeTab, setActiveTab] = useState<TabType>('posted');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to view your jobs</p>
        </div>
      </div>
    );
  }

  const jobIds: number[] = [];
  for (let i = 0; i < Number(count || 0); i++) {
    jobIds.push(i);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Jobs</h1>
          <p className="text-gray-400">Manage your posted jobs and track your applications</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('posted')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'posted'
                ? 'text-[#0052FF] border-b-2 border-[#0052FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Posted by Me
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'applied'
                ? 'text-[#0052FF] border-b-2 border-[#0052FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Applied
          </button>
          <button
            onClick={() => setActiveTab('working')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'working'
                ? 'text-[#0052FF] border-b-2 border-[#0052FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Working On
          </button>
        </div>

        {/* Job Lists */}
        <div className="space-y-4">
          {activeTab === 'posted' && (
            <PostedJobs jobIds={jobIds} clientAddress={address} />
          )}
          {activeTab === 'applied' && (
            <AppliedJobs jobIds={jobIds} freelancerAddress={address} />
          )}
          {activeTab === 'working' && (
            <WorkingJobs jobIds={jobIds} freelancerAddress={address} />
          )}
        </div>
      </div>
    </div>
  );
}

function PostedJobs({ jobIds, clientAddress }: { jobIds: number[]; clientAddress?: string }) {
  const jobs = jobIds.map(id => {
    const { job } = useJob(BigInt(id));
    return job;
  }).filter(job => job && job.client.toLowerCase() === clientAddress?.toLowerCase());

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">You haven't posted any jobs yet</p>
        <Link
          href="/jobs/new"
          className="inline-block px-6 py-3 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors"
        >
          Post Your First Job
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => job && <JobCard key={job.id.toString()} job={job} />)}
    </div>
  );
}

function AppliedJobs({ jobIds, freelancerAddress }: { jobIds: number[]; freelancerAddress?: string }) {
  // This would need to check applications - for now showing placeholder
  return (
    <div className="text-center py-12">
      <p className="text-gray-400 mb-4">Track jobs you've applied to</p>
      <Link
        href="/jobs"
        className="inline-block px-6 py-3 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors"
      >
        Browse Open Jobs
      </Link>
    </div>
  );
}

function WorkingJobs({ jobIds, freelancerAddress }: { jobIds: number[]; freelancerAddress?: string }) {
  const jobs = jobIds.map(id => {
    const { job } = useJob(BigInt(id));
    return job;
  }).filter(job => 
    job && 
    job.freelancer.toLowerCase() === freelancerAddress?.toLowerCase() &&
    (job.state === 1 || job.state === 2) // ASSIGNED or SUBMITTED
  );

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">You're not currently working on any jobs</p>
        <Link
          href="/jobs"
          className="inline-block px-6 py-3 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors"
        >
          Find Work
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => job && <JobCard key={job.id.toString()} job={job} />)}
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  const state = jobStateToLabel(job.state);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-black border border-gray-800 rounded-lg p-6 hover:border-[#0052FF]/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">Job #{job.id.toString()}</h3>
            <span className={`px-3 py-1 rounded-full text-xs border ${STATE_COLORS[state]}`}>
              {state}
            </span>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{job.description}</p>
          <div className="flex flex-wrap gap-2">
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
        <div className="ml-6 text-right">
          <p className="text-2xl font-bold text-white">{formatUsdc(job.amount)}</p>
          {job.applicationCount > BigInt(0) && (
            <p className="text-sm text-gray-400 mt-1">
              {job.applicationCount.toString()} {job.applicationCount === BigInt(1) ? 'application' : 'applications'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-800">
        <span>Client: {formatAddress(job.client)}</span>
        {job.freelancer !== '0x0000000000000000000000000000000000000000' && (
          <span>Freelancer: {formatAddress(job.freelancer)}</span>
        )}
      </div>
    </Link>
  );
}
