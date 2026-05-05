'use client';

import Link from 'next/link';
import { formatAddress, formatUsdc, jobStateToLabel, STATE_COLORS, type Job } from '@/lib/utils';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const stateLabel = jobStateToLabel(job.state);
  const stateColor = STATE_COLORS[stateLabel];

  // Truncate description for preview
  const descriptionPreview = job.description.length > 150 
    ? job.description.substring(0, 150) + '...' 
    : job.description;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block p-6 bg-black border border-[#0052FF] rounded-lg hover:border-[#0046DD] hover:shadow-lg hover:shadow-[#0052FF]/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Job #{job.id.toString()}</h3>
          <p className="text-2xl font-bold text-[#0052FF] mt-1">{formatUsdc(job.amount)}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* Description Preview */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{descriptionPreview}</p>

      {/* Skills */}
      {job.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {job.requiredSkills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#0052FF]/10 text-[#0052FF] text-xs rounded border border-[#0052FF]/30"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{job.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm pt-3 border-t border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-500">Client:</span>
          <span className="font-mono text-gray-300">{formatAddress(job.client)}</span>
        </div>
        {job.freelancer !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex justify-between">
            <span className="text-gray-500">Freelancer:</span>
            <span className="font-mono text-gray-300">{formatAddress(job.freelancer)}</span>
          </div>
        )}
        {stateLabel === 'OPEN' && (
          <div className="flex justify-between">
            <span className="text-gray-500">Applications:</span>
            <span className="text-[#0052FF] font-medium">{job.applicationCount.toString()}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
