# FreelancerEscrow.sol Deployment Guide

## Deploy via Remix IDE

### Step 1: Open Remix IDE
Go to [https://remix.ethereum.org](https://remix.ethereum.org)

### Step 2: Create the Contract File
1. In the File Explorer, create a new file: `FreelancerEscrow.sol`
2. Copy the entire contents of `contracts/FreelancerEscrow.sol` from this repo
3. Paste it into Remix

### Step 3: Compile
1. Go to the "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.24` or higher
3. Click "Compile FreelancerEscrow.sol"
4. Ensure there are no errors

### Step 4: Connect to Arc Testnet
1. Go to the "Deploy & Run Transactions" tab
2. In "Environment", select **"Injected Provider - MetaMask"**
3. MetaMask will prompt you to connect
4. **Switch your MetaMask to Arc Testnet**:
   - Network Name: `Arc Testnet`
   - RPC URL: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Currency Symbol: `USDC`
   - Block Explorer: `https://testnet.arcscan.network`

### Step 5: Get Testnet USDC
1. Visit the [Circle Faucet](https://faucet.circle.com)
2. Select "Arc Testnet"
3. Paste your wallet address
4. Request testnet USDC (you'll need this for gas fees on Arc)

### Step 6: Deploy the Contract
1. In the "Deploy" section, select `FreelancerEscrow` from the dropdown
2. Fill in the constructor parameters:
   - `_arbitrator`: Your wallet address (or a dedicated arbitrator address you control)
   - `_usdc`: `0x3600000000000000000000000000000000000000` (USDC on Arc Testnet)
   - `_reputationRegistry`: `0x8004B663056A597Dffe9eCcC1965A193B7388713` (ERC-8004 ReputationRegistry on Arc Testnet)
3. Click **"Deploy"**
4. Confirm the transaction in MetaMask
5. Wait for confirmation (should be < 1 second on Arc)

### Step 7: Copy the Deployed Address
1. After deployment, you'll see the contract under "Deployed Contracts"
2. Click the copy icon next to the contract address
3. **Save this address** — you'll need it for the frontend

Example deployed address format: `0x1234567890abcdef1234567890abcdef12345678`

### Step 8: Verify on Explorer (Optional)
1. Go to [https://testnet.arcscan.network](https://testnet.arcscan.network)
2. Paste your deployed contract address
3. You should see the deployment transaction

---

## Constructor Parameters Reference

| Parameter | Value | Description |
|-----------|-------|-------------|
| `_arbitrator` | Your wallet address | The address that can resolve disputes |
| `_usdc` | `0x3600000000000000000000000000000000000000` | USDC token address on Arc Testnet |
| `_reputationRegistry` | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | ERC-8004 ReputationRegistry on Arc Testnet |

---

## Next Steps

After deployment:
1. Copy the deployed contract address
2. Create a `.env.local` file in the `frontend/` directory
3. Add: `NEXT_PUBLIC_ESCROW_ADDRESS=0xYourDeployedAddress`
4. Continue with frontend setup (see `frontend/README.md`)

---

## Troubleshooting

**"Insufficient funds" error:**
- Make sure you have testnet USDC in your wallet (get it from the faucet)
- USDC is the gas token on Arc, so you need it to deploy

**"Invalid address" error:**
- Double-check all three constructor parameters
- Ensure addresses start with `0x` and are 42 characters long

**MetaMask not connecting:**
- Make sure you've added Arc Testnet to MetaMask
- Try refreshing Remix and reconnecting

**Contract not appearing after deployment:**
- Check the transaction on [testnet.arcscan.network](https://testnet.arcscan.network)
- If it failed, check the revert reason and try again
