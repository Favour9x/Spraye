'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { ARC_TESTNET_CHAIN_ID } from '@/constants';

export function NetworkGuard() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (chainId !== ARC_TESTNET_CHAIN_ID) {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-yellow-800">
            You're connected to the wrong network. Please switch to Arc Testnet.
          </p>
          <button
            onClick={() => switchChain?.({ chainId: ARC_TESTNET_CHAIN_ID })}
            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Switch to Arc Testnet
          </button>
        </div>
      </div>
    );
  }

  return null;
}
