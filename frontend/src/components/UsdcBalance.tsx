'use client';

import { useAccount } from 'wagmi';
import { useUsdcBalance } from '@/lib/hooks/useUsdcBalance';
import { formatUsdc } from '@/lib/utils';

export function UsdcBalance() {
  const { address } = useAccount();
  const { balance, isLoading } = useUsdcBalance(address, true);

  if (!address) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700">
        {balance !== undefined ? formatUsdc(balance) : '0.00 USDC'}
      </span>
    </div>
  );
}
