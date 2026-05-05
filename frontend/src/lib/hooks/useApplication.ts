import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';
import type { Application } from '../utils';

export function useApplication(jobId: bigint | undefined, freelancer: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'getApplication',
    args: jobId !== undefined && freelancer !== undefined ? [jobId, freelancer] : undefined,
    query: {
      enabled: jobId !== undefined && freelancer !== undefined,
    },
  });

  return {
    application: data as Application | undefined,
    isLoading,
    error,
    refetch,
  };
}
