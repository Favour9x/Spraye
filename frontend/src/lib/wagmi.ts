'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'ArcHire',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0bef75de6f140b5d11bb5c9c98e4db79',
  chains: [arcTestnet],
  ssr: true,
});
