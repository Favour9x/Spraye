import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useTransferProofLink(jobId: bigint) {
  const { data: proofLink, isLoading, error, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'transferProofLinks',
    args: [jobId],
    query: {
      refetchInterval: 15000, // Poll every 15 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  });

  // Debug logging
  console.log('🔍 Transfer Proof Link Debug:', {
    jobId: jobId.toString(),
    proofLink,
    isEmpty: !proofLink || proofLink === '',
    timestamp: new Date().toLocaleTimeString()
  });

  return {
    proofLink: proofLink as string | undefined,
    isLoading,
    error,
    refetch,
  };
}
