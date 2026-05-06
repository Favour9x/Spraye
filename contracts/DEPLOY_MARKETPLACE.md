# FreelancerMarketplace.sol Deployment Guide

## 🚀 Deploy via Remix IDE

### Step 1: Open Remix IDE
Go to [https://remix.ethereum.org](https://remix.ethereum.org)

### Step 2: Create the Contract File
1. In the File Explorer, create a new file: `FreelancerMarketplace.sol`
2. Copy the entire contents of `contracts/FreelancerMarketplace.sol` from this repo
3. Paste it into Remix

### Step 3: Configure Compiler Settings ⚠️ IMPORTANT
1. Go to the "Solidity Compiler" tab (left sidebar)
2. Select compiler version: **`0.8.24`** or higher
3. **CRITICAL:** Click "Advanced Configurations" (at the bottom)
4. **Enable "via IR"** checkbox (this uses the new IR-based code generator)
   - This is required to avoid the "Copying nested calldata dynamic arrays" error
5. Click "Compile FreelancerMarketplace.sol"
6. Ensure there are no errors

**Why "via IR" is needed:**
The old Solidity code generator cannot copy `string[] calldata` to storage directly. The new IR-based generator handles this correctly.

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
1. In the "Deploy" section, select `FreelancerMarketplace` from the dropdown
2. Fill in the constructor parameters:
   - `_arbitrator`: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
   - `_usdc`: `0x3600000000000000000000000000000000000000`
   - `_reputationRegistry`: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
3. Click **"Deploy"**
4. Confirm the transaction in MetaMask
5. Wait for confirmation (should be < 1 second on Arc)

### Step 7: Copy the Deployed Address
1. After deployment, you'll see the contract under "Deployed Contracts"
2. Click the copy icon next to the contract address
3. **Save this address** — you'll need it for the frontend

Example deployed address format: `0x1234567890abcdef1234567890abcdef12345678`

### Step 8: Update Frontend
1. Open `frontend/src/constants/index.ts`
2. Replace the contract address:
   ```typescript
   export const FREELANCER_ESCROW_ADDRESS = '0xYOUR_NEW_ADDRESS_HERE' as `0x${string}`;
   ```
3. Save the file
4. Rebuild and redeploy the frontend

### Step 9: Verify on Explorer
1. Go to [https://testnet.arcscan.network](https://testnet.arcscan.network)
2. Paste your deployed contract address
3. You should see the deployment transaction
4. Check the "Contract" tab to verify functions

---

## 📋 Constructor Parameters Reference

| Parameter | Value | Description |
|-----------|-------|-------------|
| `_arbitrator` | `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689` | The address that can resolve disputes |
| `_usdc` | `0x3600000000000000000000000000000000000000` | USDC token address on Arc Testnet |
| `_reputationRegistry` | `0x8004B663056A597Dffe9eCcC1965A193B7388713` | ERC-8004 ReputationRegistry on Arc Testnet |

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Contract deployed successfully
- [ ] Address copied and saved
- [ ] Contract visible on testnet.arcscan.network
- [ ] `jobCount()` returns 0 (no jobs yet)
- [ ] `createJob()` function exists with signature: `createJob(uint256, string, string[])`
- [ ] Frontend updated with new address
- [ ] Test job creation works
- [ ] USDC is deducted from wallet
- [ ] Job appears in dashboard

---

## 🔧 Troubleshooting

### "UnimplementedFeatureError: Copying nested calldata dynamic arrays"
**Solution:** Enable "via IR" in compiler settings (see Step 3)

### "Insufficient funds" error
- Make sure you have testnet USDC in your wallet (get it from the faucet)
- USDC is the gas token on Arc, so you need it to deploy

### "Invalid address" error
- Double-check all three constructor parameters
- Ensure addresses start with `0x` and are 42 characters long

### MetaMask not connecting
- Make sure you've added Arc Testnet to MetaMask
- Try refreshing Remix and reconnecting

### Contract not appearing after deployment
- Check the transaction on [testnet.arcscan.network](https://testnet.arcscan.network)
- If it failed, check the revert reason and try again

### Compilation takes a long time
- The IR-based code generator is slower but more robust
- Wait 30-60 seconds for compilation to complete

---

## 🎯 Expected Functions in Deployed Contract

After deployment, your contract should have these functions:

**Write Functions:**
- `createJob(uint256 amount, string description, string[] requiredSkills)`
- `applyForJob(uint256 jobId, string proposal)`
- `assignFreelancer(uint256 jobId, address freelancer)`
- `submitWork(uint256 jobId, string deliverable)`
- `approveWork(uint256 jobId)`
- `raiseDispute(uint256 jobId)`
- `resolveDispute(uint256 jobId, bool favorFreelancer)`

**Read Functions:**
- `jobCount()` → uint256
- `getJob(uint256 jobId)` → Job struct
- `getApplicants(uint256 jobId)` → address[]
- `getApplication(uint256 jobId, address freelancer)` → Application struct
- `arbitrator()` → address
- `usdc()` → address
- `reputationRegistry()` → address

---

## 📝 Next Steps

After successful deployment:
1. ✅ Update frontend with new contract address
2. ✅ Test job creation
3. ✅ Test job application
4. ✅ Test full workflow (create → apply → assign → submit → approve)
5. ✅ Verify USDC transfers work correctly
6. ✅ Check all transactions on explorer

---

**Deployment Guide Version:** 2.0  
**Last Updated:** May 6, 2026  
**Contract:** FreelancerMarketplace (Marketplace Model)
