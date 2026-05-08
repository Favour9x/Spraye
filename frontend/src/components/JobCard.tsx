'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatAddress, formatUsdc, jobStateToLabel, STATE_COLORS, type Job } from '@/lib/utils';

interface JobCardProps {
  job: Job;
}

function DeadlineCountdown({ deadline }: { deadline: bigint }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadlineSeconds = Number(deadline);
      const diff = deadlineSeconds - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Applications Closed');
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days} day${days > 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setTimeLeft(`${minutes} minute${minutes > 1 ? 's' : ''}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`text-xs font-medium ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
      {isExpired ? '🔒 Applications Closed' : `⏰ Applications close in: ${timeLeft}`}
    </div>
  );
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
      className="block p-6 glass-card glass-hover rounded-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Job #{job.id.toString()}</h3>
          <p className="text-2xl font-bold text-[#0052FF] mt-1">{formatUsdc(job.amount)}</p>
          {/* Show deadline countdown for OPEN jobs */}
          {stateLabel === 'OPEN' && job.deadline && (
            <div className="mt-2">
              <DeadlineCountdown deadline={job.deadline} />
            </div>
          )}
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
