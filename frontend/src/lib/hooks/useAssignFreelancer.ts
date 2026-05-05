import { useState, useCallback } from 'react';
import { useWriteContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

type Status = 'idle' | 'pending' | 'success' | 'error';

export function useAssignFreelancer() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();

  const assignFreelancer = useCallback(
    async (jobId: bigint, freelancer: `0x${string}`) => {
      try {
        setStatus('pending');
        setError(null);
        setTxHash(null);

        const hash = await writeContractAsync({
          ...ESCROW_CONTRACT,
          functionName: 'assignFreelancer',
          args: [jobId, freelancer],
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
    assignFreelancer,
    status,
    txHash,
    error,
  };
}
