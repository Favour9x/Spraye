# ABI Update Guide for Updated Contract

## Overview
After deploying the new FreelancerMarketplace contract, you need to update the ABI in `frontend/src/lib/contracts.ts`.

---

## How to Get the New ABI from Remix

1. After compiling in Remix, go to **"Solidity Compiler"** tab
2. Scroll down to **"Compilation Details"**
3. Click the **"ABI"** button
4. Copy the entire JSON array

---

## Key Changes in the New ABI

### 1. New Constructor Parameter
**Old** (3 parameters):
```json
{
  "inputs": [
    { "internalType": "address", "name": "_arbitrator", "type": "address" },
    { "internalType": "address", "name": "_usdc", "type": "address" },
    { "internalType": "address", "name": "_reputationRegistry", "type": "address" }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
}
```

**New** (4 parameters):
```json
{
  "inputs": [
    { "internalType": "address", "name": "_arbitrator", "type": "address" },
    { "internalType": "address", "name": "_usdc", "type": "address" },
    { "internalType": "address", "name": "_reputationRegistry", "type": "address" },
    { "internalType": "address", "name": "_platformWallet", "type": "address" }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
}
```

### 2. New Error: InsufficientDisputeFee
```json
{
  "inputs": [
    { "internalType": "uint256", "name": "provided", "type": "uint256" },
    { "internalType": "uint256", "name": "required", "type": "uint256" }
  ],
  "name": "InsufficientDisputeFee",
  "type": "error"
}
```

### 3. Updated JobState Enum
**Old** (6 states):
- 0: OPEN
- 1: ASSIGNED
- 2: SUBMITTED
- 3: APPROVED
- 4: DISPUTED
- 5: RESOLVED

**New** (7 states):
- 0: OPEN
- 1: ASSIGNED
- 2: SUBMITTED
- 3: TRANSFER_REQUESTED ← **NEW**
- 4: APPROVED
- 5: DISPUTED
- 6: RESOLVED

### 4. New Function: requestTransfer
```json
{
  "inputs": [
    { "internalType": "uint256", "name": "jobId", "type": "uint256" }
  ],
  "name": "requestTransfer",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}
```

### 5. New Event: TransferRequested
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" }
  ],
  "name": "TransferRequested",
  "type": "event"
}
```

### 6. New Event: PlatformFeePaid
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
    { "indexed": false, "internalType": "uint256", "name": "feeAmount", "type": "uint256" }
  ],
  "name": "PlatformFeePaid",
  "type": "event"
}
```

### 7. New Event: DisputeFeePaid
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "payer", "type": "address" }
  ],
  "name": "DisputeFeePaid",
  "type": "event"
}
```

### 8. Updated Event: DisputeRaised
**Old**:
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "client", "type": "address" }
  ],
  "name": "DisputeRaised",
  "type": "event"
}
```

**New** (parameter name changed from "client" to "raiser"):
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "raiser", "type": "address" }
  ],
  "name": "DisputeRaised",
  "type": "event"
}
```

### 9. New View Functions
```json
{
  "inputs": [],
  "name": "DISPUTE_FEE",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
}
```

```json
{
  "inputs": [],
  "name": "PLATFORM_FEE_PERCENT",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
}
```

```json
{
  "inputs": [],
  "name": "platformWallet",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
}
```

---

## Step-by-Step Update Process

### Step 1: Deploy Contract in Remix
1. Copy `contracts/FreelancerMarketplace.sol` to Remix
2. Compile with Solidity 0.8.24
3. Deploy with constructor parameters:
   - `_arbitrator`: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
   - `_usdc`: `0x3600000000000000000000000000000000000000`
   - `_reputationRegistry`: `0x0000000000000000000000000000000000000000`
   - `_platformWallet`: `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
4. Copy the deployed contract address

### Step 2: Get ABI from Remix
1. In Remix, go to "Solidity Compiler" tab
2. Click "Compilation Details"
3. Click "ABI" button
4. Copy the entire JSON

### Step 3: Update Frontend Constants
In `frontend/src/constants/index.ts`:
```typescript
export const FREELANCER_ESCROW_ADDRESS = '0xYOUR_NEW_CONTRACT_ADDRESS' as `0x${string}`;
```

### Step 4: Update Frontend ABI
In `frontend/src/lib/contracts.ts`:

Replace the entire `ESCROW_ABI` constant with the ABI you copied from Remix:

```typescript
export const ESCROW_ABI = [
  // Paste the entire ABI from Remix here
] as const;
```

### Step 5: Update Utils (JobState Mapping)
In `frontend/src/lib/utils.ts`, update the `jobStateToLabel` function:

**Old**:
```typescript
export type JobState = 'OPEN' | 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED';

export function jobStateToLabel(state: number): JobState {
  const states: JobState[] = ['OPEN', 'ASSIGNED', 'SUBMITTED', 'APPROVED', 'DISPUTED', 'RESOLVED'];
  return states[state] || 'OPEN';
}
```

**New**:
```typescript
export type JobState = 'OPEN' | 'ASSIGNED' | 'SUBMITTED' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED';

export function jobStateToLabel(state: number): JobState {
  const states: JobState[] = ['OPEN', 'ASSIGNED', 'SUBMITTED', 'TRANSFER_REQUESTED', 'APPROVED', 'DISPUTED', 'RESOLVED'];
  return states[state] || 'OPEN';
}
```

Also add color for the new state:
```typescript
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

---

## Testing the ABI Update

After updating, test these functions in your frontend:

### 1. Test requestTransfer
```typescript
import { useWriteContract } from 'wagmi';
import { ESCROW_CONTRACT } from '@/lib/contracts';

const { writeContract } = useWriteContract();

// Should work without errors
await writeContract({
  ...ESCROW_CONTRACT,
  functionName: 'requestTransfer',
  args: [BigInt(jobId)],
});
```

### 2. Test View Functions
```typescript
import { useReadContract } from 'wagmi';
import { ESCROW_CONTRACT } from '@/lib/contracts';

// Should return 5
const { data: platformFee } = useReadContract({
  ...ESCROW_CONTRACT,
  functionName: 'PLATFORM_FEE_PERCENT',
});

// Should return 1000000
const { data: disputeFee } = useReadContract({
  ...ESCROW_CONTRACT,
  functionName: 'DISPUTE_FEE',
});

// Should return platform wallet address
const { data: platformWallet } = useReadContract({
  ...ESCROW_CONTRACT,
  functionName: 'platformWallet',
});
```

### 3. Test Job State
```typescript
// Job in TRANSFER_REQUESTED state should show state = 3
const { data: job } = useReadContract({
  ...ESCROW_CONTRACT,
  functionName: 'getJob',
  args: [BigInt(jobId)],
});

console.log(job.state); // Should be 3 for TRANSFER_REQUESTED
```

---

## Common Issues and Solutions

### Issue 1: "Function not found" error
**Cause**: ABI not updated correctly
**Solution**: Re-copy ABI from Remix, ensure you copied the entire JSON array

### Issue 2: Job state shows wrong label
**Cause**: `jobStateToLabel` function not updated
**Solution**: Update `frontend/src/lib/utils.ts` with new state mapping

### Issue 3: Contract address not updated
**Cause**: Still using old contract address
**Solution**: Update `FREELANCER_ESCROW_ADDRESS` in `frontend/src/constants/index.ts`

### Issue 4: TypeScript errors after ABI update
**Cause**: Type mismatch between old and new ABI
**Solution**: Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

---

## Verification Checklist

After updating:
- [ ] Contract deployed successfully on Arc Testnet
- [ ] Contract address updated in `constants/index.ts`
- [ ] ABI updated in `contracts.ts`
- [ ] `jobStateToLabel` function updated in `utils.ts`
- [ ] `STATE_COLORS` updated with TRANSFER_REQUESTED
- [ ] TypeScript compiles without errors
- [ ] `requestTransfer` function callable from frontend
- [ ] Platform fee constants readable from contract
- [ ] Dispute fee constant readable from contract
- [ ] Job states display correctly in UI

---

## Rollback Instructions

If something goes wrong:

1. Revert contract address to old address in `constants/index.ts`
2. Revert ABI to old ABI in `contracts.ts`
3. Revert `jobStateToLabel` to old version in `utils.ts`
4. Rebuild frontend: `npm run build`
5. Old contract will continue working

The old contract remains on the blockchain and is fully functional.
