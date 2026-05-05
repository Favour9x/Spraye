# Freelancer Escrow Setup Guide

## What's Been Built

✅ **Smart Contract** (`contracts/FreelancerEscrow.sol`)
- Complete Solidity contract with all state machine logic
- ERC-8004 reputation integration (try/catch pattern)
- Custom errors for gas efficiency
- Ready to deploy via Remix IDE

✅ **Frontend Foundation** (`frontend/`)
- Next.js 14 with TypeScript and Tailwind CSS
- wagmi v2 + viem v2 + RainbowKit for Web3
- Arc Testnet chain configuration (built-in from viem/chains)
- All contract ABIs and constants
- Utility functions (address/USDC formatting, error parsing)
- All wagmi hooks (read + write)
- Shared UI components (ConnectButton, NetworkGuard, UsdcBalance, TxNotification, JobCard)
- Job list page (`/jobs`)

## What's Left to Build

### 1. Create Job Form Page (`/jobs/new`)
- Form with freelancer address + USDC amount inputs
- Inline validation
- Two-step flow: approve USDC → create job
- Navigate to job detail on success

### 2. Job Detail Page (`/jobs/[id]`)
- Display all job fields
- Role-based action buttons:
  - Freelancer (FUNDED state): Submit Work form
  - Client (SUBMITTED state): Approve / Raise Dispute buttons
  - Arbitrator (DISPUTED state): Resolve for Freelancer / Resolve for Client buttons
- Auto-refresh job data after transactions

### 3. Root Page Redirect
- `src/app/page.tsx` → redirect to `/jobs`

### 4. Fix useCreateJob Hook
- The current implementation has a bug with `useReadContract.fetcher` and `useWaitForTransactionReceipt.fetcher`
- Need to use proper wagmi hooks instead of `.fetcher` pattern
- Simplify to: check allowance → approve if needed → create job

---

## Deployment Steps

### Step 1: Deploy Smart Contract via Remix

1. Open [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create `FreelancerEscrow.sol` and paste the contract from `contracts/FreelancerEscrow.sol`
3. Compile with Solidity `^0.8.24`
4. Connect MetaMask to Arc Testnet:
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Currency Symbol: `USDC`
   - Block Explorer: `https://testnet.arcscan.network`
5. Get testnet USDC from [https://faucet.circle.com](https://faucet.circle.com)
6. Deploy with constructor params:
   - `_arbitrator`: Your wallet address
   - `_usdc`: `0x3600000000000000000000000000000000000000`
   - `_reputationRegistry`: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
7. Copy the deployed contract address

### Step 2: Configure Frontend

1. Get a WalletConnect Project ID from [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ESCROW_ADDRESS=0xYourDeployedContractAddress
   ```

### Step 3: Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Testing the App

1. **Connect Wallet** → RainbowKit modal, switch to Arc Testnet
2. **Create Job** → `/jobs/new`, enter freelancer address + amount, approve USDC, create job
3. **Submit Work** (as freelancer) → `/jobs/[id]`, enter deliverable URL/text
4. **Approve Work** (as client) → `/jobs/[id]`, click Approve → USDC released + reputation updated
5. **Dispute Flow** (optional) → Raise Dispute → Resolve as Arbitrator

---

## Known Issues to Fix

1. **useCreateJob hook** — needs refactor to use proper wagmi hooks (not `.fetcher`)
2. **Missing pages** — `/jobs/new` and `/jobs/[id]` need to be created
3. **Root redirect** — `src/app/page.tsx` needs redirect to `/jobs`

---

## File Structure

```
.
├── contracts/
│   ├── FreelancerEscrow.sol       # Smart contract (deploy via Remix)
│   └── DEPLOYMENT.md              # Remix deployment guide
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout with providers
│   │   │   ├── page.tsx           # TODO: redirect to /jobs
│   │   │   └── jobs/
│   │   │       ├── page.tsx       # Job list (DONE)
│   │   │       ├── new/
│   │   │       │   └── page.tsx   # TODO: Create job form
│   │   │       └── [id]/
│   │   │           └── page.tsx   # TODO: Job detail
│   │   ├── components/
│   │   │   ├── ConnectButton.tsx  # RainbowKit button
│   │   │   ├── NetworkGuard.tsx   # Arc Testnet switch prompt
│   │   │   ├── UsdcBalance.tsx    # Display USDC balance
│   │   │   ├── TxNotification.tsx # Transaction status toast
│   │   │   └── JobCard.tsx        # Job summary card
│   │   ├── lib/
│   │   │   ├── wagmi.ts           # wagmi config
│   │   │   ├── providers.tsx      # WagmiProvider + RainbowKit
│   │   │   ├── contracts.ts       # ABIs + contract configs
│   │   │   ├── utils.ts           # Formatting + error parsing
│   │   │   └── hooks/
│   │   │       ├── useJob.ts
│   │   │       ├── useJobCount.ts
│   │   │       ├── useUsdcBalance.ts
│   │   │       ├── useCreateJob.ts      # TODO: fix .fetcher bug
│   │   │       ├── useSubmitWork.ts
│   │   │       ├── useApproveWork.ts
│   │   │       ├── useRaiseDispute.ts
│   │   │       └── useResolveDispute.ts
│   │   └── constants/
│   │       └── index.ts           # Chain ID, addresses, explorer URL
│   └── .env.local                 # WalletConnect ID + contract address
└── README.md
```

---

## Next Steps

1. Deploy the contract via Remix (see `contracts/DEPLOYMENT.md`)
2. Update `.env.local` with contract address + WalletConnect ID
3. Fix `useCreateJob` hook
4. Build `/jobs/new` page
5. Build `/jobs/[id]` page
6. Add root redirect
7. Test end-to-end on Arc Testnet

---

## Resources

- [Arc Testnet Docs](https://docs.arc.network)
- [Arc Testnet Explorer](https://testnet.arcscan.network)
- [Circle Faucet](https://faucet.circle.com)
- [Remix IDE](https://remix.ethereum.org)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
