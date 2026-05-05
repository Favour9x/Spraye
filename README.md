# Freelancer Escrow on Arc Testnet

A trustless freelance escrow application built on Arc Testnet with USDC custody and ERC-8004 reputation integration.

## ✅ What's Built

### Smart Contract (`contracts/FreelancerEscrow.sol`)
- Complete Solidity implementation with 5-state machine
- USDC escrow with ERC-20 interface
- ERC-8004 reputation integration (try/catch pattern)
- Custom errors for gas efficiency
- Ready to deploy via Remix IDE

### Frontend (`frontend/`)
- Next.js 14 + TypeScript + Tailwind CSS
- wagmi v2 + viem v2 + RainbowKit
- Arc Testnet configuration (built-in from viem/chains)
- All pages: Job list, Create job, Job detail
- Role-based UI (Client / Freelancer / Arbitrator)
- Real-time job updates

## 🚀 Quick Start

### 1. Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `FreelancerEscrow.sol` and paste from `contracts/FreelancerEscrow.sol`
3. Compile with Solidity `^0.8.24`
4. Connect MetaMask to Arc Testnet:
   - **Network Name:** Arc Testnet
   - **RPC URL:** https://rpc.testnet.arc.network
   - **Chain ID:** 5042002
   - **Currency Symbol:** USDC
   - **Block Explorer:** https://testnet.arcscan.network
5. Get testnet USDC from [Circle Faucet](https://faucet.circle.com)
6. Deploy with constructor params:
   - `_arbitrator`: Your wallet address
   - `_usdc`: `0x3600000000000000000000000000000000000000`
   - `_reputationRegistry`: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
7. **Copy the deployed contract address**

See `contracts/DEPLOYMENT.md` for detailed instructions.

### 2. Configure Frontend

1. Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_ESCROW_ADDRESS=0xYourDeployedContractAddress
   ```

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

1. **Create Job** — Client deposits USDC into escrow
2. **Submit Work** — Freelancer submits deliverable (URL or text)
3. **Approve** — Client approves → USDC released + reputation updated
4. **Dispute** — Client raises dispute → Arbitrator resolves

## 🎯 Features

- **USDC as Gas** — Arc uses USDC for gas fees (6 decimals for ERC-20)
- **Sub-second Finality** — Transactions confirm in < 1 second
- **ERC-8004 Reputation** — Onchain reputation scores for freelancers
- **Role-Based UI** — Different actions for Client / Freelancer / Arbitrator
- **Public Job List** — Anyone can browse all jobs
- **Real-time Updates** — Job state refreshes automatically

## 📁 Project Structure

```
.
├── contracts/
│   ├── FreelancerEscrow.sol       # Smart contract
│   └── DEPLOYMENT.md              # Remix deployment guide
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js pages
│   │   ├── components/            # React components
│   │   ├── lib/
│   │   │   ├── hooks/             # wagmi hooks
│   │   │   ├── wagmi.ts           # wagmi config
│   │   │   ├── contracts.ts       # ABIs
│   │   │   └── utils.ts           # Utilities
│   │   └── constants/             # Chain config
│   └── .env.local                 # Environment variables
└── README.md
```

## 🔗 Resources

- [Arc Testnet Docs](https://docs.arc.network)
- [Arc Testnet Explorer](https://testnet.arcscan.network)
- [Circle Faucet](https://faucet.circle.com)
- [Remix IDE](https://remix.ethereum.org)
- [WalletConnect Cloud](https://cloud.walletconnect.com)

## 🛠️ Tech Stack

- **Smart Contract:** Solidity 0.8.24
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Web3:** wagmi v2, viem v2, RainbowKit v2
- **Blockchain:** Arc Testnet (Chain ID 5042002)
- **Token:** USDC (6 decimals)

## 📝 License

MIT
