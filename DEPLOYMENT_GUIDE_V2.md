# FreelancerMarketplace V2 - Complete Deployment & Update Guide

## Overview
This guide covers deploying the updated FreelancerMarketplace V2 contract and updating the frontend to use the new features.

## What's New in V2

### Contract Changes
1. ✅ **GitHub Username Storage** - Stored onchain per job (no more localStorage issues)
2. ✅ **Transfer Confirmation** - `confirmTransfer()` function with proof link storage
3. ✅ **Adjustable Platform Fee** - `setPlatformFee()` function (default 5%)
4. ✅ **Application Deadline** - Deadline field added to Job struct
5. ✅ **Estimated Delivery** - Added to Application struct
6. ✅ **New Getter Functions** - `getGithubUsername()`, `getTransferProofLink()`
7. ✅ **New Events** - `TransferConfirmed`, `PlatformFeeUpdated`

### Frontend Changes
1. ✅ **Removed all debug logging** - Clean production code
2. ✅ **Job Creation Form** - Added deadline dropdown, GitHub username passed to contract
3. ✅ **Application Form** - Added required estimated delivery dropdown
4. ✅ **Work Submission** - Fetches GitHub username from contract (not localStorage)
5. ✅ **Transfer Confirmation** - Fetches GitHub username from contract
6. ✅ **Updated ABI** - All new contract functions and events included

---

## Part 1: Deploy Contract in Remix

### Step 1: Open Remix
1. Go to https://remix.ethereum.org
2. Create a new file: `FreelancerMarketplace.sol`
3. Copy the entire content from `contracts/FreelancerMarketplace.sol`
4. Paste into Remix

### Step 2: Compile
1. Select Solidity compiler version: **0.8.24**
2. Click "Compile FreelancerMarketplace.sol"
3. Verify no errors (should show green checkmark)

### Step 3: Deploy
1. Go to "Deploy & Run Transactions" tab
2. Environment: Select **"Injected Provider - MetaMask"**
3. Ensure MetaMask is connected to **Arc Testnet** (Chain ID: 5042002)
4. Enter constructor parameters (in order):

```
_arbitrator: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
_usdc: 0x3600000000000000000000000000000000000000
_reputationRegistry: 0x8004B663056A597Dffe9eCcC1965A193B7388713
_platformWallet: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
```

5. Click **"Deploy"**
6. Confirm transaction in MetaMask
7. **SAVE THE NEW CONTRACT ADDRESS** - You'll need it for frontend updates

### Step 4: Verify Deployment
Test these functions in Remix to confirm deployment:
- `arbitrator()` → Should return `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- `platformWallet()` → Should return `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- `platformFeePercent()` → Should return `5`
- `DISPUTE_FEE()` → Should return `1000000` (1 USDC in 6 decimals)

---

## Part 2: Update Frontend

### Step 1: Update Contract Address

**File: `frontend/.env.local`**
```env
NEXT_PUBLIC_ESCROW_ADDRESS=<YOUR_NEW_CONTRACT_ADDRESS>
```

**File: `frontend/src/constants/index.ts`**
```typescript
export const FREELANCER_ESCROW_ADDRESS = '<YOUR_NEW_CONTRACT_ADDRESS>' as `0x${string}`;
```

### Step 2: Verify ABI is Updated
The ABI in `frontend/src/lib/contracts.ts` has already been updated with:
- New `createJob()` signature with `githubUsername` and `deadline` parameters
- New `applyForJob()` signature with `estimatedDelivery` parameter
- New `confirmTransfer()` function
- New `setPlatformFee()` function
- New `getGithubUsername()` function
- New `getTransferProofLink()` function
- Updated events: `TransferConfirmed`, `PlatformFeeUpdated`
- Updated Job struct with `deadline` field
- Updated Application struct with `estimatedDelivery` field

### Step 3: Test Locally (Optional)
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 and test:
1. Create a job with GitHub username and deadline
2. Apply for a job with estimated delivery time
3. Submit work and verify GitHub username displays correctly
4. Test transfer confirmation flow

---

## Part 3: Deploy to Production

### Push to GitHub
```bash
git add .
git commit -m "Update to FreelancerMarketplace V2 with onchain GitHub storage and deadlines"
git push origin main
```

### Vercel Auto-Deploy
Vercel will automatically detect the push and redeploy your frontend with the new contract address and ABI.

---

## Testing Checklist

### Contract Functions
- [ ] `createJob()` with GitHub username and deadline
- [ ] `applyForJob()` with estimated delivery
- [ ] `getGithubUsername()` returns correct username
- [ ] `confirmTransfer()` stores proof link
- [ ] `getTransferProofLink()` returns proof link
- [ ] `setPlatformFee()` (only platform wallet can call)
- [ ] `platformFeePercent()` returns current fee

### Frontend Features
- [ ] Job creation form shows deadline dropdown
- [ ] Job creation form passes GitHub username to contract
- [ ] Application form shows estimated delivery dropdown (required)
- [ ] Work submission page fetches GitHub username from contract
- [ ] Transfer confirmation page fetches GitHub username from contract
- [ ] No debug boxes or console logs visible
- [ ] All transactions confirm successfully

---

## Troubleshooting

### Remix Compilation Error
If you see "ParserError: Expected primary expression" at a line number that doesn't exist:
1. Create a fresh file in Remix
2. Copy the contract content again
3. Ensure no extra characters or encoding issues
4. Compile with Solidity 0.8.24

### Frontend Not Updating
1. Clear browser cache and hard refresh (Ctrl+Shift+R)
2. Verify contract address is correct in both `.env.local` and `constants/index.ts`
3. Check Vercel deployment logs for errors
4. Ensure you're connected to Arc Testnet in MetaMask

### GitHub Username Not Showing
1. Verify the job was created with V2 contract (has `getGithubUsername()` function)
2. Check that GitHub username was provided during job creation
3. Old jobs created with V1 contract won't have GitHub usernames

---

## Migration Notes

### Old Jobs (V1 Contract)
- Jobs created with the old contract will NOT have GitHub usernames stored onchain
- Freelancers working on old jobs should contact clients directly for GitHub usernames
- Consider completing old jobs before fully migrating to V2

### New Jobs (V2 Contract)
- All new jobs will have GitHub usernames stored onchain
- No more localStorage issues with wrong usernames
- Deadline enforcement will work for all new jobs

---

## Support

If you encounter issues:
1. Check the contract is deployed correctly in Remix
2. Verify the contract address matches in frontend files
3. Ensure you're using the correct network (Arc Testnet, Chain ID 5042002)
4. Check browser console for errors
5. Verify MetaMask is connected and has USDC for gas

---

## Summary

✅ Contract ready: `contracts/FreelancerMarketplace.sol`
✅ Frontend updated: All components and hooks updated
✅ ABI updated: `frontend/src/lib/contracts.ts`
✅ Debug code removed: Clean production code
✅ Ready to deploy: Follow steps above

**Next Steps:**
1. Deploy contract in Remix
2. Update contract address in frontend
3. Push to GitHub
4. Vercel auto-deploys
5. Test all features
