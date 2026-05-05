import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';
import type { Job } from '../utils';

export function useJob(jobId: bigint | undefined, watch = false) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'getJob',
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: jobId !== undefined,
      refetchInterval: watch ? 4000 : false,
    },
  });

  return {
    job: data as Job | undefined,
    isLoading,
    error,
    refetch,
  };
}
