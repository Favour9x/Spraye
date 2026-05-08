'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useSetPlatformFee() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const setPlatformFee = async (newFeePercent: number) => {
    try {
      setStatus('pending');
      setError(null);

      writeContract({
        ...ESCROW_CONTRACT,
        functionName: 'setPlatformFee',
        args: [BigInt(newFeePercent)],
      });

      setStatus('success');
    } catch (err: any) {
      console.error('Failed to set platform fee:', err);
      setError(err.message || 'Failed to set platform fee');
      setStatus('error');
    }
  };

  return {
    setPlatformFee,
    status: isConfirming ? 'pending' : isConfirmed ? 'success' : status,
    error,
    isConfirming,
    isConfirmed,
  };
}
