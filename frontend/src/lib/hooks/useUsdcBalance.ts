import { useReadContract } from 'wagmi';
import { USDC_CONTRACT } from '../contracts';

export function useUsdcBalance(address: `0x${string}` | undefined, watch = false) {
  const { data, isLoading, refetch } = useReadContract({
    ...USDC_CONTRACT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: watch ? 4000 : false,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}
