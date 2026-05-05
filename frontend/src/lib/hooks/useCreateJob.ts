import { useState, useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { ESCROW_CONTRACT, USDC_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

type Status = 'idle' | 'checking' | 'approving' | 'pending' | 'success' | 'error';

export function useCreateJob() {
  const { address } = useAccount();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);

  const { writeContractAsync } = useWriteContract();

  const createJob = useCallback(
    async (amount: bigint, description: string, requiredSkills: string[]) => {
      if (!address) {
        setError('Wallet not connected');
        setStatus('error');
        return;
      }

      try {
        setStatus('checking');
        setError(null);
        setTxHash(null);
        setJobId(null);

        // Step 1: Approve USDC (always approve the full amount for simplicity)
        setStatus('approving');
        const approveTxHash = await writeContractAsync({
          ...USDC_CONTRACT,
          functionName: 'approve',
          args: [ESCROW_CONTRACT.address, amount],
        });

        // Wait for approval confirmation
        setStatus('pending');

        // Step 2: Create job
        const createTxHash = await writeContractAsync({
          ...ESCROW_CONTRACT,
          functionName: 'createJob',
          args: [amount, description, requiredSkills],
        });

        setTxHash(createTxHash);
        setStatus('success');

        // Note: jobId extraction from events would require decoding logs
        // For simplicity, we'll let the UI refetch the job count to get the new job ID
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
    [address, writeContractAsync]
  );

  return {
    createJob,
    status,
    txHash,
    jobId,
    error,
  };
}
