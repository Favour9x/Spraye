import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

type Status = 'idle' | 'pending' | 'success' | 'error';

export function useApproveWork() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  const approveWork = useCallback(
    async (jobId: bigint) => {
      try {
        setStatus('pending');
        setError(null);
        setTxHash(null);

        const hash = await writeContractAsync({
          ...ESCROW_CONTRACT,
          functionName: 'approveWork',
          args: [jobId],
        });

        setTxHash(hash);
        setStatus('success');
      } catch (err) {
        const parsedError = parseContractError(err);
        if (parsedError === 'CANCELLED') {
          setStatus('idle');
        } else {
          setError(parsedError);
          setStatus('error');
        }
      }
    },
    [writeContractAsync]
  );

  return {
    approveWork,
    status,
    txHash,
    error,
  };
}
