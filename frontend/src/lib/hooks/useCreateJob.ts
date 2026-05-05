import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ESCROW_CONTRACT, USDC_CONTRACT } from '../contracts';
import { parseContractError } from '../utils';

type Status = 'idle' | 'checking' | 'approving' | 'waiting-approval' | 'pending' | 'waiting-creation' | 'success' | 'error';

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

      // Debug logging
      console.log('🚀 Creating job with:');
      console.log('  Amount:', amount.toString());
      console.log('  Description:', description);
      console.log('  Skills:', requiredSkills);
      console.log('  USDC Contract:', USDC_CONTRACT.address);
      console.log('  Escrow Contract:', ESCROW_CONTRACT.address);
      console.log('  User Address:', address);

      try {
        setStatus('checking');
        setError(null);
        setTxHash(null);
        setJobId(null);

        // Step 1: Approve USDC
        console.log('📝 Step 1: Approving USDC...');
        setStatus('approving');
        
        let approveTxHash;
        try {
          approveTxHash = await writeContractAsync({
            ...USDC_CONTRACT,
            functionName: 'approve',
            args: [ESCROW_CONTRACT.address, amount],
          });
          console.log('✅ Approval transaction sent:', approveTxHash);
        } catch (approveError) {
          console.error('❌ Approval failed:', approveError);
          throw approveError;
        }
        
        console.log('⏳ Waiting for approval confirmation...');
        setStatus('waiting-approval');
        
        // Wait for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('✅ Approval confirmed!');

        // Step 2: Create job
        console.log('📝 Step 2: Creating job...');
        setStatus('pending');
        
        let createTxHash;
        try {
          createTxHash = await writeContractAsync({
            ...ESCROW_CONTRACT,
            functionName: 'createJob',
            args: [amount, description, requiredSkills],
          });
          console.log('✅ Job creation transaction sent:', createTxHash);
        } catch (createError) {
          console.error('❌ Job creation failed:', createError);
          throw createError;
        }

        console.log('⏳ Waiting for job creation confirmation...');
        setStatus('waiting-creation');
        
        // Wait for job creation to be mined
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('✅ Job created successfully!');
        setTxHash(createTxHash);
        setStatus('success');

      } catch (err) {
        console.error('❌ Error in createJob:', err);
        const parsedError = parseContractError(err);
        console.error('❌ Parsed error:', parsedError);
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
