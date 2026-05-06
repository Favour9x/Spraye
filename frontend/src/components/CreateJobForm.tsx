'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateJob } from '@/lib/hooks/useCreateJob';
import { useJobCount } from '@/lib/hooks/useJobCount';
import { TxNotification } from './TxNotification';
import { isValidAmount, parseUsdc } from '@/lib/utils';

export function CreateJobForm() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; description?: string; skills?: string }>({});

  const { createJob, status, txHash, error } = useCreateJob();
  const { count, refetch } = useJobCount();

  // Navigate to jobs list after success and force refresh
  useEffect(() => {
    if (status === 'success') {
      console.log('✅ Job creation successful, waiting before redirect...');
      // Wait longer for blockchain state to propagate, then redirect to jobs list
      setTimeout(() => {
        console.log('🔄 Redirecting to jobs page...');
        try {
          // Use Next.js router for client-side navigation
          router.push('/jobs');
          // Force a refresh after navigation
          setTimeout(() => {
            router.refresh();
          }, 500);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          // Fallback to full page reload if router fails
          window.location.href = '/jobs';
        }
      }, 2000);
    }
  }, [status, router]);

  const validate = (): boolean => {
    const newErrors: { amount?: string; description?: string; skills?: string } = {};

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (!isValidAmount(amount)) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (description.length > 2048) {
      newErrors.description = 'Description must be 2048 characters or less';
    }

    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    if (skillsArray.length === 0) {
      newErrors.skills = 'At least one skill is required';
    } else if (skillsArray.length > 10) {
      newErrors.skills = 'Maximum 10 skills allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const amountInWei = parseUsdc(amount);
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
    await createJob(amountInWei, description, skillsArray);
  };

  const isDisabled = status === 'checking' || status === 'approving' || status === 'waiting-approval' || status === 'pending' || status === 'waiting-creation';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* USDC Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
          USDC Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            errors.amount ? 'border-red-500' : 'border-gray-700'
          } ${isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-400">{errors.amount}</p>
        )}
      </div>

      {/* Job Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Job Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what needs to be done..."
          rows={4}
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            errors.description ? 'border-red-500' : 'border-gray-700'
          } ${isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/2048 characters
        </p>
      </div>

      {/* Required Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">
          Required Skills
        </label>
        <input
          type="text"
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Solidity, React, TypeScript (comma-separated)"
          disabled={isDisabled}
          className={`w-full px-4 py-2 bg-black border rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-transparent text-white ${
            errors.skills ? 'border-red-500' : 'border-gray-700'
          } ${isDisabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
        />
        {errors.skills && (
          <p className="mt-1 text-sm text-red-400">{errors.skills}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter up to 10 skills, separated by commas
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full px-4 py-3 text-white font-medium rounded-lg transition-colors ${
          isDisabled
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-[#0052FF] hover:bg-[#0046DD]'
        }`}
      >
        {status === 'checking' && 'Checking allowance...'}
        {status === 'approving' && 'Approving USDC...'}
        {status === 'waiting-approval' && 'Waiting for approval confirmation...'}
        {status === 'pending' && 'Creating job...'}
        {status === 'waiting-creation' && 'Waiting for job creation...'}
        {status === 'idle' && 'Post Job'}
        {status === 'success' && 'Success! Redirecting...'}
        {status === 'error' && 'Try Again'}
      </button>

      {/* Success message with manual navigation */}
      {status === 'success' && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
          <p className="text-green-400 text-sm mb-2">
            ✅ Job created successfully! Redirecting to jobs page...
          </p>
          <p className="text-gray-400 text-xs">
            If you're not redirected automatically,{' '}
            <button
              onClick={() => router.push('/jobs')}
              className="text-[#0052FF] hover:text-[#0046DD] underline"
            >
              click here
            </button>
          </p>
        </div>
      )}

      {/* Transaction Notification */}
      <TxNotification status={status} txHash={txHash} error={error} />
    </form>
  );
}
