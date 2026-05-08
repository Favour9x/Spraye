# Deploy FreelancerMarketplace V2 in Remix

## Quick Deployment Steps

### 1. Remix Setup
- Open https://remix.ethereum.org
- Create new file: `FreelancerMarketplace.sol`
- Copy content from `contracts/FreelancerMarketplace.sol`
- Compiler: Solidity 0.8.24
- Click "Compile"

### 2. Deploy
- Environment: "Injected Provider - MetaMask"
- Network: Arc Testnet (Chain ID 5042002)
- Constructor parameters:
```
0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
0x3600000000000000000000000000000000000000
0x8004B663056A597Dffe9eCcC1965A193B7388713
0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
```
- Click "Deploy"
- **SAVE THE NEW CONTRACT ADDRESS**

### 3. After Deployment
Update these files with the new contract address:
- `frontend/.env.local` → `NEXT_PUBLIC_ESCROW_ADDRESS`
- `frontend/src/constants/index.ts` → `FREELANCER_ESCROW_ADDRESS`

Then update the ABI in `frontend/src/lib/contracts.ts` (see ABI_UPDATE.md)
