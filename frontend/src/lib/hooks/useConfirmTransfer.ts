'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useConfirmTransfer() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const confirmTransfer = async (jobId: bigint, imgurLink: string) => {
    try {
      setStatus('pending');
      setError(null);

      writeContract({
        ...ESCROW_CONTRACT,
        functionName: 'confirmTransfer',
        args: [jobId, imgurLink],
      });

      setStatus('success');
    } catch (err: any) {
      console.error('Failed to confirm transfer:', err);
      setError(err.message || 'Failed to confirm transfer');
      setStatus('error');
    }
  };

  return {
    confirmTransfer,
    status: isConfirming ? 'pending' : isConfirmed ? 'success' : status,
    error,
    isConfirming,
    isConfirmed,
  };
}
