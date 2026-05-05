'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'ArcHire',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [arcTestnet],
  ssr: true,
});
