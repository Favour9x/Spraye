# Deploy Updated FreelancerMarketplace Contract

## Contract Updates Summary

### 1. New Job State: TRANSFER_REQUESTED
- Added between SUBMITTED and APPROVED
- Full state order: OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → APPROVED/DISPUTED → RESOLVED

### 2. Platform Fee (5%)
- Deducted from freelancer payment on job approval
- Platform wallet: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- Client pays full amount, freelancer receives 95%

### 3. Dispute Fee (1 USDC)
- Required when raising a dispute
- Paid by whoever raises the dispute (client or freelancer)
- Non-refundable regardless of outcome

---

## Deployment Steps

### Step 1: Copy Contract to Remix

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `FreelancerMarketplace.sol`
3. Copy the entire contract from `contracts/FreelancerMarketplace.sol`
4. Paste into Remix

### Step 2: Compile

1. Go to "Solidity Compiler" tab
2. Select compiler version: `0.8.24`
3. Click "Compile FreelancerMarketplace.sol"
4. Verify: ✅ Green checkmark appears

### Step 3: Deploy

1. Go to "Deploy & Run Transactions" tab
2. **Environment**: Injected Provider - MetaMask
3. **Network**: Arc Testnet (Chain ID: 5042002)
4. **Contract**: Select `FreelancerMarketplace`

5. **Constructor Parameters** (in order):
   ```
   _arbitrator: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
   _usdc: 0x3600000000000000000000000000000000000000
   _reputationRegistry: 0x0000000000000000000000000000000000000000
   _platformWallet: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
   ```

6. Click "Deploy"
7. Confirm transaction in MetaMask
8. Wait for confirmation
9. **Copy the deployed contract address**

### Step 4: Verify Deployment

In Remix console, you should see:
- ✅ Transaction confirmed
- ✅ Contract address displayed

Test the deployment:
```javascript
// Call these view functions to verify
platformWallet() // Should return: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
PLATFORM_FEE_PERCENT() // Should return: 5
DISPUTE_FEE() // Should return: 1000000
arbitrator() // Should return: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
```

---

## Update Frontend

### Step 1: Update Contract Address

In `frontend/src/constants/index.ts`:

```typescript
export const MARKETPLACE_CONTRACT_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS_HERE';
```

### Step 2: Update ABI

The ABI will be automatically generated when you compile in Remix.

**To get the ABI**:
1. In Remix, after compiling, go to "Solidity Compiler" tab
2. Scroll down to "Compilation Details"
3. Click "ABI" button
4. Copy the entire ABI JSON

**Update `frontend/src/lib/contracts.ts`**:

Replace the `MARKETPLACE_ABI` constant with the new ABI from Remix.

Key changes in the ABI:
- New `requestTransfer` function
- New `TransferRequested` event
- New `PlatformFeePaid` event
- New `DisputeFeePaid` event
- Updated `JobState` enum (now has 7 states instead of 6)
- Updated constructor (now takes 4 parameters instead of 3)

---

## New Contract Features

### 1. requestTransfer Function
```solidity
function requestTransfer(uint256 jobId) external
```
- Only callable by client
- Only when job is in SUBMITTED state
- Changes state to TRANSFER_REQUESTED
- Emits `TransferRequested` event

### 2. Platform Fee Deduction
- Automatically deducted in `approveWork()`
- 5% goes to platform wallet
- 95% goes to freelancer
- Emits `PlatformFeePaid` event

### 3. Dispute Fee Requirement
- `raiseDispute()` now requires 1 USDC payment
- Caller must approve contract for 1 USDC before calling
- Fee transferred to platform wallet immediately
- Emits `DisputeFeePaid` event

### 4. Updated approveWork
- Can be called from SUBMITTED or TRANSFER_REQUESTED state
- Automatically calculates and deducts platform fee

### 5. Updated raiseDispute
- Can be called by client OR freelancer
- Can be called from SUBMITTED or TRANSFER_REQUESTED state
- Requires 1 USDC dispute fee payment

---

## Testing Checklist

After deployment, test these scenarios:

### Basic Flow:
- [ ] Create job (client pays full amount)
- [ ] Apply for job
- [ ] Assign freelancer
- [ ] Submit work
- [ ] Request transfer (new function)
- [ ] Approve work (freelancer receives 95%, platform gets 5%)

### Dispute Flow:
- [ ] Create and assign job
- [ ] Submit work
- [ ] Raise dispute (requires 1 USDC fee)
- [ ] Resolve dispute (freelancer gets 95% if favored, client gets 100% if favored)

### State Transitions:
- [ ] OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → APPROVED
- [ ] OPEN → ASSIGNED → SUBMITTED → DISPUTED → RESOLVED
- [ ] OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → DISPUTED → RESOLVED

---

## Important Notes

1. **Platform Wallet**: All fees go to `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
2. **Dispute Fee**: 1 USDC = 1,000,000 (6 decimals)
3. **Platform Fee**: 5% of job amount
4. **USDC Approvals**: 
   - Clients must approve job amount for `createJob()`
   - Dispute raisers must approve 1 USDC for `raiseDispute()`

5. **Breaking Changes**:
   - JobState enum changed (TRANSFER_REQUESTED added at index 3)
   - Constructor now requires 4 parameters instead of 3
   - raiseDispute now requires USDC payment
   - approveWork now deducts platform fee

---

## Rollback Plan

If issues occur:
1. Keep old contract address as backup
2. Frontend can be reverted by changing contract address in constants
3. Old contract remains functional on blockchain
4. No data migration needed (fresh start with new contract)

---

## Next Steps After Deployment

1. Update frontend constants with new contract address
2. Update ABI in contracts.ts
3. Test all functions on Arc Testnet
4. Update documentation with new contract address
5. Announce new features to users
