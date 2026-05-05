'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useFreelancerProfile } from '@/lib/hooks/useFreelancerProfile';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { useJob } from '@/lib/hooks/useJob';
import { formatAddress } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { profile, updateSkills } = useFreelancerProfile(address);
  const { count } = useJobCount();
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Get completed jobs for this freelancer
  const completedJobs: bigint[] = [];
  for (let i = 0; i < Number(count || 0); i++) {
    completedJobs.push(BigInt(i));
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateSkills([...profile.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    updateSkills(profile.skills.filter(s => s !== skill));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Freelancer Profile</h1>
          <p className="text-gray-400">Manage your skills and view your work history</p>
        </div>

        {/* Profile Card */}
        <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your Address</h2>
              <p className="text-gray-400 font-mono">{formatAddress(address || '')}</p>
            </div>
            <Link
              href={`/freelancer/${address}`}
              className="px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors text-sm"
            >
              View Public Profile
            </Link>
          </div>

          {/* Skills Section */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Your Skills</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#0052FF] hover:text-[#0046DD] text-sm font-medium"
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Skills Display */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet. Add your skills to get job recommendations!</p>
              ) : (
                profile.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-3 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded-full text-sm border border-[#0052FF]/30 flex items-center gap-2"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Skill Input */}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill (e.g., Solidity, React)"
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0052FF]"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Job Recommendations */}
        {profile.skills.length > 0 && (
          <div className="bg-black border border-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Jobs</h3>
            <p className="text-gray-400 text-sm mb-4">
              Based on your skills: {profile.skills.join(', ')}
            </p>
            <Link
              href="/jobs"
              className="inline-block px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors text-sm"
            >
              Browse Matching Jobs
            </Link>
          </div>
        )}

        {/* Completed Jobs */}
        <CompletedJobsSection address={address} />
      </div>
    </div>
  );
}

function CompletedJobsSection({ address }: { address?: string }) {
  const { count } = useJobCount();
  const completedJobs: number[] = [];

  // Find completed jobs where this address was the freelancer
  for (let i = 0; i < Number(count || 0); i++) {
    completedJobs.push(i);
  }

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Work History</h3>
      <div className="space-y-3">
        {completedJobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed jobs yet</p>
        ) : (
          completedJobs.slice(0, 5).map((jobId) => (
            <CompletedJobCard key={jobId} jobId={BigInt(jobId)} freelancerAddress={address} />
          ))
        )}
      </div>
    </div>
  );
}

function CompletedJobCard({ jobId, freelancerAddress }: { jobId: bigint; freelancerAddress?: string }) {
  const { job } = useJob(jobId);

  if (!job || job.freelancer.toLowerCase() !== freelancerAddress?.toLowerCase()) {
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
        </div>
        <span className="ml-4 px-2 py-1 bg-green-900/30 text-green-300 border border-green-700 rounded text-xs">
          Completed
        </span>
      </div>
    </Link>
  );
}
