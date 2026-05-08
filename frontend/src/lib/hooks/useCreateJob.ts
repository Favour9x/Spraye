import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { ESCROW_CONTRACT, USDC_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

type Status = 'idle' | 'checking' | 'approving' | 'waiting-approval' | 'pending' | 'waiting-creation' | 'success' | 'error';

export function useCreateJob() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);

  const { writeContractAsync } = useWriteContract();

  const createJob = useCallback(
    async (amount: bigint, description: string, requiredSkills: string[], githubUsername: string, deadline: bigint) => {
      if (!address) {
        setError('Wallet not connected');
        setStatus('error');
        return;
      }

      if (!publicClient) {
        setError('Network not connected');
        setStatus('error');
        return;
      }

      try {
        setStatus('checking');
        setError(null);
        setTxHash(null);
        setJobId(null);

        // Step 1: Approve USDC
        setStatus('approving');
        
        let approveTxHash;
        try {
          approveTxHash = await writeContractAsync({
            ...USDC_CONTRACT,
            functionName: 'approve',
            args: [ESCROW_CONTRACT.address, amount],
          });
        } catch (approveError) {
          throw approveError;
        }
        
        setStatus('waiting-approval');
        
        // Wait for approval transaction receipt
        const approvalReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveTxHash,
          confirmations: 1,
        });

        // Step 2: Create job with new parameters
        setStatus('pending');
        
        let createTxHash;
        try {
          createTxHash = await writeContractAsync({
            ...ESCROW_CONTRACT,
            functionName: 'createJob',
            args: [amount, description, requiredSkills, githubUsername, deadline],
          });
        } catch (createError) {
          throw createError;
        }

        setStatus('waiting-creation');
        
        // Wait for job creation transaction receipt
        const creationReceipt = await publicClient.waitForTransactionReceipt({
          hash: createTxHash,
          confirmations: 1,
        });
        
        setTxHash(createTxHash);
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
    [address, publicClient, writeContractAsync]
  );

  return {
    createJob,
    status,
    txHash,
    jobId,
    error,
  };
}
