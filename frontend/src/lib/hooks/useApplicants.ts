import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useApplicants(jobId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'getApplicants',
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: jobId !== undefined,
    },
  });

  return {
    applicants: data as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  };
}
