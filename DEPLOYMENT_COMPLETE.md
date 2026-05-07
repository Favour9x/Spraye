# ✅ ArcHire Contract Deployment Complete

## Contract Deployed Successfully

**Contract Address:** `0x6e1859b89fc09c291C7a898aC2F4830804B23AA8`

**Deployment Parameters:**
- Arbitrator: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- USDC: `0x3600000000000000000000000000000000000000`
- Reputation Registry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- Platform Wallet: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`

## Contract Updates Implemented

### 1. TRANSFER_REQUESTED State
- Added new job state at index 3: `TRANSFER_REQUESTED`
- Full state order: `OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → APPROVED/DISPUTED → RESOLVED`
- New function: `requestTransfer(uint256 jobId)` - callable by client when job is SUBMITTED
- New event: `TransferRequested(uint256 indexed jobId)`

### 2. Platform Fee (5%)
- Constant: `PLATFORM_FEE_PERCENT = 5`
- Platform wallet: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- Fee deducted from freelancer payment in `approveWork()` and `resolveDispute()`
- Example: 100 USDC job → freelancer receives 95 USDC, platform receives 5 USDC
- New event: `PlatformFeePaid(uint256 indexed jobId, uint256 feeAmount)`

### 3. Dispute Fee (1 USDC)
- Constant: `DISPUTE_FEE = 1_000_000` (1 USDC in 6 decimals)
- Required when calling `raiseDispute()`
- Paid by whoever raises the dispute (client or freelancer)
- Non-refundable, goes to platform wallet
- New event: `DisputeFeePaid(uint256 indexed jobId, address indexed payer)`

## Frontend Updates Completed

### ✅ 1. Contract Address Updated
**File:** `frontend/src/constants/index.ts`
- Updated `FREELANCER_ESCROW_ADDRESS` to `0x6e1859b89fc09c291C7a898aC2F4830804B23AA8`

### ✅ 2. ABI Updated
**File:** `frontend/src/lib/contracts.ts`
- Updated constructor to include `_platformWallet` parameter
- Added `PLATFORM_FEE_PERCENT` constant getter
- Added `DISPUTE_FEE` constant getter
- Added `platformWallet` getter
- Added `requestTransfer(uint256 jobId)` function
- Added `TransferRequested` event
- Added `PlatformFeePaid` event
- Updated `DisputeRaised` event (changed `client` to `raiser`)
- Added `DisputeFeePaid` event

### ✅ 3. Job State Updated
**File:** `frontend/src/lib/utils.ts`
- Added `TRANSFER_REQUESTED` to JobState type
- Updated `jobStateToLabel()` to include TRANSFER_REQUESTED at index 3
- Added color for TRANSFER_REQUESTED: `bg-blue-900/30 text-blue-300 border-blue-700`

### ✅ 4. Platform Fee Notice Added
**File:** `frontend/src/components/CreateJobForm.tsx`
- Added notice below USDC amount field:
  > **Note:** A 5% platform fee is deducted from the freelancer payment on job completion. Example: for a 100 USDC job, the freelancer receives 95 USDC.

### ✅ 5. Request Transfer Hook Created
**File:** `frontend/src/lib/hooks/useRequestTransfer.ts`
- New hook for calling `requestTransfer()` function
- Handles transaction states and errors

### ✅ 6. ActionButtons Component Updated
**File:** `frontend/src/components/ActionButtons.tsx`
- Added support for TRANSFER_REQUESTED state
- "Request Repo Transfer" button appears after first checkbox is checked
- Button calls `requestTransfer()` contract function
- Shows green success message when transfer is requested
- Auto-checks second checkbox when state is TRANSFER_REQUESTED
- Updated dispute form to show 1 USDC fee warning
- Changed dispute button text to "Pay 1 USDC and Raise Dispute"
- Updated approval button description to mention 5% platform fee

### ✅ 7. FreelancerTransferConfirmation Updated
**File:** `frontend/src/components/FreelancerTransferConfirmation.tsx`
- **CRITICAL CHANGE:** Now reads job state directly from blockchain instead of localStorage
- Polls blockchain every 15 seconds using `useReadContract` hook
- Checks if `job.state === 3` (TRANSFER_REQUESTED)
- Shows transfer instructions when blockchain state is TRANSFER_REQUESTED
- Works across all devices and browsers (no localStorage dependency for state detection)

### ✅ 8. JobDetail Component Updated
**File:** `frontend/src/components/JobDetail.tsx`
- Added TRANSFER_REQUESTED to active job notice condition
- Updated freelancer transfer confirmation to show for both SUBMITTED and TRANSFER_REQUESTED states
- Updated ActionButtons to accept TRANSFER_REQUESTED state
- Client can now review work in both SUBMITTED and TRANSFER_REQUESTED states

## How It Works Now

### Transfer Request Flow

1. **Freelancer submits work** → Job state: SUBMITTED
2. **Client reviews demo link** → Checks first checkbox
3. **Client clicks "Request Repo Transfer"** → Calls `requestTransfer()` → Job state: TRANSFER_REQUESTED
4. **Blockchain state updates** → Freelancer page polls every 15 seconds
5. **Freelancer sees transfer instructions** → Automatically when state === 3
6. **Freelancer transfers repo** → Confirms with imgur link
7. **Client verifies transfer** → Checks third checkbox
8. **Client approves work** → Payment released (95% to freelancer, 5% to platform)

### Dispute Flow

1. **Client or freelancer raises dispute** → Must pay 1 USDC fee
2. **Fee is non-refundable** → Goes to platform wallet
3. **Arbitrator reviews** → Decides outcome
4. **If freelancer wins** → Receives 95% of job amount, 5% to platform
5. **If client wins** → Receives full refund (no platform fee)

## Testing Checklist

- [ ] Create a new job and verify platform fee notice appears
- [ ] Submit work as freelancer
- [ ] Request transfer as client (verify blockchain transaction)
- [ ] Verify freelancer page updates automatically (within 15 seconds)
- [ ] Complete transfer confirmation
- [ ] Approve work and verify 5% platform fee is deducted
- [ ] Test dispute flow with 1 USDC fee
- [ ] Verify arbitrator can resolve disputes
- [ ] Test cross-device sync (client requests transfer on desktop, freelancer sees it on mobile)

## Build and Deploy Frontend

```bash
cd frontend
npm run build
npm run start
```

## Important Notes

1. **Cross-Device Sync:** The transfer request now works across devices because it reads from the blockchain, not localStorage
2. **Polling Interval:** Freelancer page checks blockchain every 15 seconds for state updates
3. **Platform Fee:** Always deducted from freelancer payment (client pays full amount upfront)
4. **Dispute Fee:** 1 USDC paid by whoever raises the dispute, non-refundable
5. **State Transitions:** SUBMITTED → TRANSFER_REQUESTED → APPROVED (or DISPUTED)

## Contract Verification

To verify the contract on ArcScan:
1. Go to https://testnet.arcscan.network/address/0x6e1859b89fc09c291C7a898aC2F4830804B23AA8
2. Click "Verify & Publish"
3. Upload `contracts/FreelancerMarketplace.sol`
4. Compiler version: `0.8.24`
5. Optimization: Enabled (200 runs)

---

**Status:** ✅ All contract and frontend updates complete. Ready for testing.
