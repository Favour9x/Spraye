'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';
import { NetworkGuard } from '@/components/NetworkGuard';
import { UsdcBalance } from '@/components/UsdcBalance';
import { CreateJobForm } from '@/components/CreateJobForm';

export default function NewJobPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <NetworkGuard />
      
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/jobs" className="text-2xl font-bold text-white hover:text-gray-300">
                ArcHire
              </Link>
              <p className="text-sm text-gray-400 mt-1">Trustless Freelancing on Arc</p>
            </div>
            <div className="flex items-center gap-4">
              <UsdcBalance />
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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

        <div className="bg-black border border-[#0052FF] rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create New Job</h1>
          <p className="text-sm text-gray-400 mb-8">
            Post a job and let freelancers apply with their proposals
          </p>

          <CreateJobForm />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-black border border-[#0052FF] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-2">How it works</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Post your job with description and required skills</li>
            <li>Freelancers apply with proposals explaining their fit</li>
            <li>Review applications and assign the best candidate</li>
            <li>Freelancer completes work and submits deliverable</li>
            <li>Approve work to release payment or raise a dispute</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
