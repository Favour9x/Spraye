import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '../contracts';

export function useJobCount(watch = false) {
  const { data, isLoading, refetch } = useReadContract({
    ...ESCROW_CONTRACT,
    functionName: 'jobCount',
    query: {
      refetchInterval: watch ? 4000 : false,
    },
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    refetch,
  };
}
