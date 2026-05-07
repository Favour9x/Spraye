# Complete ArcHire Update Summary

## ✅ Contract Updates Complete

### Updated Contract: `contracts/FreelancerMarketplace.sol`

**New Features**:
1. ✅ TRANSFER_REQUESTED job state (index 3)
2. ✅ `requestTransfer(uint256 jobId)` function
3. ✅ 5% platform fee deducted from freelancer payment
4. ✅ 1 USDC dispute fee required when raising disputes
5. ✅ Platform wallet: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`

**Events Added**:
- `TransferRequested(uint256 indexed jobId)`
- `PlatformFeePaid(uint256 indexed jobId, uint256 feeAmount)`
- `DisputeFeePaid(uint256 indexed jobId, address indexed payer)`

**Constructor Updated**:
- Now requires 4 parameters (added `_platformWallet`)

---

## 📋 Deployment Instructions

### Step 1: Deploy New Contract in Remix

1. Copy `contracts/FreelancerMarketplace.sol` to Remix
2. Compile with Solidity 0.8.24
3. Deploy with these constructor parameters:
   ```
   _arbitrator: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
   _usdc: 0x3600000000000000000000000000000000000000
   _reputationRegistry: 0x0000000000000000000000000000000000000000
   _platformWallet: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
   ```
4. **Copy the deployed contract address**

### Step 2: Get ABI from Remix

1. In Remix, go to "Solidity Compiler" tab
2. Click "Compilation Details"
3. Click "ABI" button
4. Copy the entire JSON

### Step 3: Update Frontend Files

#### File 1: `frontend/src/constants/index.ts`
```typescript
export const FREELANCER_ESCROW_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS' as `0x${string}`;
```

#### File 2: `frontend/src/lib/contracts.ts`
Replace the entire `ESCROW_ABI` with the ABI from Remix.

Key changes:
- Constructor now has 4 parameters
- New `requestTransfer` function
- New events: `TransferRequested`, `PlatformFeePaid`, `DisputeFeePaid`
- New view functions: `PLATFORM_FEE_PERCENT`, `DISPUTE_FEE`, `platformWallet`

#### File 3: `frontend/src/lib/utils.ts`

Update JobState type and mapping:

```typescript
export type JobState = 'OPEN' | 'ASSIGNED' | 'SUBMITTED' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED';

export function jobStateToLabel(state: number): JobState {
  const states: JobState[] = ['OPEN', 'ASSIGNED', 'SUBMITTED', 'TRANSFER_REQUESTED', 'APPROVED', 'DISPUTED', 'RESOLVED'];
  return states[state] || 'OPEN';
}

export const STATE_COLORS: Record<JobState, string> = {
  OPEN: 'bg-purple-900/30 text-purple-300 border-purple-700',
  ASSIGNED: 'bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]',
  SUBMITTED: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
  TRANSFER_REQUESTED: 'bg-blue-900/30 text-blue-300 border-blue-700', // NEW
  APPROVED: 'bg-green-900/30 text-green-300 border-green-700',
  DISPUTED: 'bg-red-900/30 text-red-300 border-red-700',
  RESOLVED: 'bg-gray-800 text-gray-300 border-gray-600',
};
```

#### File 4: `frontend/src/lib/hooks/useRequestTransfer.ts`
✅ Already created - custom hook for calling `requestTransfer` function

#### File 5: `frontend/src/components/ActionButtons.tsx`
✅ Partially updated - needs completion (see below)

#### File 6: `frontend/src/components/CreateJobForm.tsx`
Add platform fee notice below budget field

#### File 7: `frontend/src/components/FreelancerTransferConfirmation.tsx`
Update to read job state from blockchain instead of localStorage

#### File 8: `frontend/src/components/JobDetail.tsx`
Update to handle TRANSFER_REQUESTED state

---

## 🔧 Frontend Changes Needed

### 1. ActionButtons Component (PARTIALLY DONE)

**What's Done**:
- ✅ Imported `useRequestTransfer` hook
- ✅ Added `requestTransfer` function call
- ✅ Updated to accept TRANSFER_REQUESTED state
- ✅ Auto-checks second checkbox when in TRANSFER_REQUESTED state
- ✅ Shows loading state while requesting transfer
- ✅ Added dispute fee notice
- ✅ Changed dispute button text to "Pay 1 USDC and Raise Dispute"

**What's Needed**:
- Complete the arbitrator section (copy from old code)
- Test the transfer request flow

### 2. CreateJobForm Component

Add this below the budget input field:

```typescript
<p className="text-xs text-gray-500 mt-1">
  Note: A 5% platform fee is deducted from the freelancer payment on job completion. 
  Example: for a 100 USDC job, the freelancer receives 95 USDC.
</p>
```

### 3. FreelancerTransferConfirmation Component

Replace localStorage polling with blockchain state reading:

```typescript
// Poll job state from blockchain every 15 seconds
useEffect(() => {
  const checkJobState = async () => {
    const job = await readContract({
      ...ESCROW_CONTRACT,
      functionName: 'getJob',
      args: [jobId],
    });
    
    // job.state === 3 means TRANSFER_REQUESTED
    if (job.state === 3) {
      setTransferRequested(true);
    }
  };

  checkJobState();
  const interval = setInterval(checkJobState, 15000); // 15 seconds

  return () => clearInterval(interval);
}, [jobId]);
```

### 4. JobDetail Component

Update to handle TRANSFER_REQUESTED state:

```typescript
// Show ActionButtons for SUBMITTED or TRANSFER_REQUESTED
{((isClient && (stateLabel === 'SUBMITTED' || stateLabel === 'TRANSFER_REQUESTED')) || 
  (isArbitrator && stateLabel === 'DISPUTED')) && (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      {isClient ? 'Review Work' : 'Resolve Dispute'}
    </h3>
    <ActionButtons
      jobId={job.id}
      role={isClient ? 'client' : 'arbitrator'}
      state={stateLabel as 'SUBMITTED' | 'TRANSFER_REQUESTED' | 'DISPUTED'}
      onSuccess={onRefresh}
    />
  </div>
)}
```

### 5. Show Fee Deduction on Job Completion

When job is approved, show breakdown:

**To Client**:
```
Payment of [full amount] USDC has been released to the freelancer.
```

**To Freelancer**:
```
You have received [95% amount] USDC. A 5% platform fee of [5% amount] USDC was deducted.
```

This can be added to the TxNotification component or as a separate success message.

---

## 🧪 Testing Checklist

After deployment and frontend updates:

### Contract Testing:
- [ ] Deploy contract successfully
- [ ] Verify `PLATFORM_FEE_PERCENT()` returns 5
- [ ] Verify `DISPUTE_FEE()` returns 1000000
- [ ] Verify `platformWallet()` returns correct address

### Frontend Testing:
- [ ] Create job shows platform fee notice
- [ ] Submit work transitions to SUBMITTED state
- [ ] Request transfer button appears after checking first checkbox
- [ ] Request transfer calls contract and transitions to TRANSFER_REQUESTED
- [ ] Freelancer page detects TRANSFER_REQUESTED state from blockchain
- [ ] Approve work deducts 5% platform fee
- [ ] Raise dispute requires 1 USDC approval
- [ ] Raise dispute shows fee notice
- [ ] Job completion shows fee breakdown

### State Transition Testing:
- [ ] OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → APPROVED
- [ ] OPEN → ASSIGNED → SUBMITTED → DISPUTED → RESOLVED
- [ ] OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → DISPUTED → RESOLVED

---

## 📝 Key Implementation Notes

### 1. Request Transfer Flow
1. Client checks first checkbox (reviewed demo)
2. "Request Repo Transfer" button appears
3. Client clicks button → wallet transaction
4. Contract changes state to TRANSFER_REQUESTED
5. Second checkbox auto-checks
6. Freelancer page polls blockchain every 15 seconds
7. When state = 3 (TRANSFER_REQUESTED), shows transfer instructions

### 2. Platform Fee
- Deducted automatically in `approveWork()`
- Client pays full amount when creating job
- Freelancer receives 95% on approval
- Platform wallet receives 5%
- Also applies when arbitrator resolves in favor of freelancer

### 3. Dispute Fee
- 1 USDC required when calling `raiseDispute()`
- Caller must approve contract for 1 USDC first
- Fee goes to platform wallet immediately
- Non-refundable regardless of outcome
- Can be raised by client OR freelancer

### 4. Blockchain as Source of Truth
- Transfer request state stored on-chain (not localStorage)
- Freelancer page reads from blockchain every 15 seconds
- Works across all devices and browsers
- No localStorage sync issues

---

## 🚀 Deployment Order

1. ✅ Deploy new contract in Remix
2. ✅ Copy contract address
3. ✅ Get ABI from Remix
4. Update `constants/index.ts` with new address
5. Update `contracts.ts` with new ABI
6. Update `utils.ts` with new JobState
7. Complete `ActionButtons.tsx` updates
8. Update `CreateJobForm.tsx` with fee notice
9. Update `FreelancerTransferConfirmation.tsx` to read from blockchain
10. Update `JobDetail.tsx` to handle TRANSFER_REQUESTED
11. Build and test frontend
12. Deploy to production

---

## 📚 Documentation Files Created

1. ✅ `contracts/FreelancerMarketplace.sol` - Updated contract
2. ✅ `contracts/DEPLOY_UPDATED_CONTRACT.md` - Deployment guide
3. ✅ `contracts/ABI_UPDATE_GUIDE.md` - ABI update instructions
4. ✅ `frontend/src/lib/hooks/useRequestTransfer.ts` - Custom hook
5. ✅ `COMPLETE_UPDATE_SUMMARY.md` - This file

---

## ⚠️ Breaking Changes

1. **JobState enum changed**: TRANSFER_REQUESTED added at index 3
2. **Constructor changed**: Now requires 4 parameters instead of 3
3. **raiseDispute changed**: Now requires 1 USDC payment
4. **approveWork changed**: Now deducts 5% platform fee
5. **Old contracts incompatible**: Must redeploy, cannot upgrade

---

## 🔄 Rollback Plan

If issues occur:
1. Revert contract address to old address in `constants/index.ts`
2. Revert ABI to old ABI in `contracts.ts`
3. Revert `jobStateToLabel` to old version
4. Rebuild frontend
5. Old contract remains functional

---

## ✅ Next Steps

1. **Deploy contract** using Remix with provided parameters
2. **Copy contract address** and ABI
3. **Update frontend** files as listed above
4. **Test thoroughly** on Arc Testnet
5. **Document** new contract address for users
6. **Announce** new features (platform fee, dispute fee, transfer request)

All contract changes are combined into one file for single deployment!
