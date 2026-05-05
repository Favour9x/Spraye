'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { useFreelancerProfile } from '@/lib/hooks/useFreelancerProfile';
import { JobCard } from '@/components/JobCard';

export default function JobsPage() {
  const { count, isLoading } = useJobCount(true);
  const { address } = useAccount();
  const { profile } = useFreelancerProfile(address);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  // Get all unique skills from all jobs
  const allSkills = new Set<string>();
  for (let i = 0; i < Number(count || 0); i++) {
    const { job } = useJob(BigInt(i));
    if (job) {
      job.requiredSkills.forEach(skill => allSkills.add(skill));
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const loadMySkills = () => {
    setSelectedSkills(profile.skills);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
            {count !== undefined && (
              <p className="text-gray-400">{count.toString()} total jobs</p>
            )}
          </div>
          <Link
            href="/jobs/new"
            className="px-6 py-3 bg-[#0052FF] text-white font-medium rounded-lg hover:bg-[#0046DD] transition-colors"
          >
            Post a Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {profile.skills.length > 0 && (
              <button
                onClick={loadMySkills}
                className="text-[#0052FF] hover:text-[#0046DD] text-sm font-medium"
              >
                Load My Skills
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="mb-4">
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

          {/* Skills Filter */}
          {allSkills.size > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Filter by Skills</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(allSkills).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-[#0052FF] text-white border-[#0052FF]'
                        : 'bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]/30 hover:bg-[#0052FF]/30'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <button
                  onClick={() => setSelectedSkills([])}
                  className="mt-3 text-sm text-gray-400 hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
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
          <div className="text-center py-12 bg-black border border-gray-800 rounded-lg">
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
            selectedSkills={selectedSkills}
            showOnlyOpen={showOnlyOpen}
          />
        ) : null}
      </div>
    </div>
  );
}

function JobList({
  count,
  selectedSkills,
  showOnlyOpen,
}: {
  count: bigint;
  selectedSkills: string[];
  showOnlyOpen: boolean;
}) {
  const jobIds = Array.from({ length: Number(count) }, (_, i) => BigInt(i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobIds.map((jobId) => (
        <JobListItem
          key={jobId.toString()}
          jobId={jobId}
          selectedSkills={selectedSkills}
          showOnlyOpen={showOnlyOpen}
        />
      ))}
    </div>
  );
}

function JobListItem({
  jobId,
  selectedSkills,
  showOnlyOpen,
}: {
  jobId: bigint;
  selectedSkills: string[];
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

  // Filter by skills
  if (selectedSkills.length > 0) {
    const hasMatchingSkill = job.requiredSkills.some(skill =>
      selectedSkills.includes(skill)
    );
    if (!hasMatchingSkill) {
      return null;
    }
  }

  return <JobCard job={job} />;
}

