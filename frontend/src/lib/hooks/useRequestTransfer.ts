'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export function useRequestTransfer() {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const requestTransfer = async (jobId: bigint) => {
    try {
      setStatus('pending');
      setError(null);

      writeContract({
        ...ESCROW_CONTRACT,
        functionName: 'requestTransfer',
        args: [jobId],
      });

      setStatus('success');
    } catch (err) {
      const errorMessage = parseContractError(err);
      if (errorMessage === 'CANCELLED') {
        setStatus('idle');
        setError(null);
      } else {
        setStatus('error');
        setError(errorMessage);
      }
    }
  };

  return {
    requestTransfer,
    status: isConfirming ? 'pending' : isConfirmed ? 'success' : status,
    txHash: hash,
    error,
  };
}
