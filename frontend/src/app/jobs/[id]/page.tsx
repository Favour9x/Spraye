'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NetworkGuard } from '@/components/NetworkGuard';
import { UsdcBalance } from '@/components/UsdcBalance';
import { JobDetail } from '@/components/JobDetail';
import { useJob } from '@/lib/hooks/useJob';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id ? BigInt(params.id as string) : undefined;

  const { job, isLoading, error, refetch } = useJob(jobId, true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <NetworkGuard />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-black border border-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
            <div className="h-12 bg-gray-800 rounded w-1/2 mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Job Not Found</h3>
            <p className="text-sm text-red-300 mb-4">
              This job doesn't exist or hasn't been created yet.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0046DD] transition-colors text-sm"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : job ? (
          <JobDetail job={job} onRefresh={refetch} />
        ) : (
          <div className="bg-black border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400">Job not found</p>
          </div>
        )}
      </main>
    </div>
  );
}
