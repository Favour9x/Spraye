'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { useFreelancerProfile } from '@/lib/hooks/useFreelancerProfile';
import { JobCard } from '@/components/JobCard';
import { ESCROW_CONTRACT } from '@/lib/contracts';
import { EXPLORER_URL } from '@/constants';

export default function JobsPage() {
  const { count, isLoading, refetch } = useJobCount(true);
  const { address } = useAccount();
  const { profile } = useFreelancerProfile(address);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  // Debug logging
  console.log('📊 Jobs Page Debug:');
  console.log('  Job Count:', count?.toString());
  console.log('  Is Loading:', isLoading);
  console.log('  Contract Address:', ESCROW_CONTRACT.address);
  console.log('  Block Explorer:', `https://testnet.arcscan.network/address/${ESCROW_CONTRACT.address}`);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
    window.location.reload();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
            {count !== undefined && (
              <p className="text-gray-400">{count.toString()} total jobs</p>
            )}
            <a
              href={`${EXPLORER_URL}/address/${ESCROW_CONTRACT.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0052FF] hover:text-[#0046DD] mt-1 inline-block"
            >
              View contract on explorer →
            </a>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              href="/jobs/new"
              className="px-6 py-3 bg-[#0052FF] text-white font-medium rounded-lg hover:bg-[#0046DD] transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card glass-hover rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>

          {/* Status Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyOpen}
                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#0052FF] focus:ring-[#0052FF]"
              />
              Show only open jobs
            </label>
          </div>
        </div>

        {/* Job List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-black border border-gray-800 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-1/3 mb-4" />
                <div className="h-8 bg-gray-800 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : count === BigInt(0) ? (
          <div className="text-center py-12 glass-card rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-white">No jobs yet</h3>
            <p className="mt-1 text-sm text-gray-400">Get started by creating the first job.</p>
            <div className="mt-6">
              <Link
                href="/jobs/new"
                className="inline-flex items-center px-4 py-2 bg-[#0052FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046DD] transition-colors"
              >
                Create the first job →
              </Link>
            </div>
          </div>
        ) : count !== undefined ? (
          <JobList
            count={count}
            showOnlyOpen={showOnlyOpen}
          />
        ) : null}
      </div>
    </div>
  );
}

function JobList({
  count,
  showOnlyOpen,
}: {
  count: bigint;
  showOnlyOpen: boolean;
}) {
  const jobIds = Array.from({ length: Number(count) }, (_, i) => BigInt(i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobIds.map((jobId) => (
        <JobListItem
          key={jobId.toString()}
          jobId={jobId}
          showOnlyOpen={showOnlyOpen}
        />
      ))}
    </div>
  );
}

function JobListItem({
  jobId,
  showOnlyOpen,
}: {
  jobId: bigint;
  showOnlyOpen: boolean;
}) {
  const { job, isLoading } = useJob(jobId);

  if (isLoading || !job) {
    return null;
  }

  // Filter by status
  if (showOnlyOpen && job.state !== 0) {
    return null;
  }

  return <JobCard job={job} />;
}

