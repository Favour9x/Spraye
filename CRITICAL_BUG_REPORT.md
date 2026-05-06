# CRITICAL BUG REPORT - ABI Mismatch

**Date:** May 6, 2026  
**Severity:** 🔴 CRITICAL  
**Status:** ✅ ROOT CAUSE IDENTIFIED

---

## 🚨 Problem Summary

**Symptom:** Transactions confirm successfully but no jobs are created and no USDC is deducted.

**Root Cause:** **ABI MISMATCH** between frontend and deployed contract.

---

## 🔍 Technical Analysis

### What's Deployed
The contract at `0x07191A01Ab724aA7c59F272946E533ec142d7E0F` is the **OLD FreelancerEscrow** contract.

**OLD createJob() signature:**
```solidity
function createJob(address freelancer, uint256 amount) external returns (uint256 jobId)
```
- Parameters: `freelancer` address, `amount`
- Simple escrow model (client assigns freelancer directly)

### What Frontend is Calling
The frontend is using the **NEW FreelancerMarketplace** ABI.

**NEW createJob() signature:**
```solidity
function createJob(uint256 amount, string calldata description, string[] calldata requiredSkills) external returns (uint256 jobId)
```
- Parameters: `amount`, `description`, `skills[]`
- Marketplace model (freelancers apply, client selects)

---

## 💥 Why This Causes Silent Failure

When the frontend calls:
```typescript
writeContractAsync({
  ...ESCROW_CONTRACT,
  functionName: 'createJob',
  args: [amount, description, requiredSkills],  // 3 parameters
});
```

The deployed contract expects:
```solidity
createJob(address freelancer, uint256 amount)  // 2 parameters
```

**Result:**
1. Transaction is sent with wrong function signature
2. EVM cannot find matching function selector
3. Transaction reverts or fails silently
4. No job is created
5. No USDC is transferred
6. Frontend shows "TXN confirmed" (approval succeeded, but createJob failed)

---

## ✅ Solutions

### Option 1: Deploy NEW FreelancerMarketplace Contract (RECOMMENDED)

**Steps:**
1. Deploy `contracts/FreelancerMarketplace.sol` to Arc Testnet
2. Update `FREELANCER_ESCROW_ADDRESS` in `frontend/src/constants/index.ts`
3. Keep current ABI in `frontend/src/lib/contracts.ts` (it's correct for the new contract)
4. Test job creation

**Pros:**
- Gets all marketplace features (applications, skills, etc.)
- Frontend already built for this
- Matches the spec and design documents

**Cons:**
- Requires new deployment
- Need to update contract address

### Option 2: Fix Frontend to Match OLD Contract (TEMPORARY)

**Steps:**
1. Replace `frontend/src/lib/contracts.ts` with `frontend/src/lib/contracts-old-escrow.ts`
2. Update `useCreateJob` hook to call `createJob(freelancerAddress, amount)`
3. Remove description and skills from UI
4. Simplify to direct assignment model

**Pros:**
- Works with existing deployed contract
- No new deployment needed

**Cons:**
- Loses all marketplace features
- Doesn't match current UI/UX
- Not the intended design

---

## 🎯 Recommended Action Plan

### IMMEDIATE FIX (Option 1 - Deploy New Contract)

1. **Deploy FreelancerMarketplace.sol**
   ```
   - Go to Remix IDE
   - Compile contracts/FreelancerMarketplace.sol
   - Deploy to Arc Testnet with constructor params:
     * _arbitrator: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
     * _usdc: 0x3600000000000000000000000000000000000000
     * _reputationRegistry: 0x8004B663056A597Dffe9eCcC1965A193B7388713
   ```

2. **Update Contract Address**
   ```typescript
   // frontend/src/constants/index.ts
   export const FREELANCER_ESCROW_ADDRESS = '0xNEW_ADDRESS_HERE' as `0x${string}`;
   ```

3. **Verify on Explorer**
   - Check contract on https://testnet.arcscan.network
   - Verify `jobCount()` returns 0
   - Verify `createJob()` function exists with correct signature

4. **Test Job Creation**
   - Create a test job
   - Verify USDC is deducted
   - Verify job appears in list
   - Verify `jobCount()` increments

---

## 📋 Verification Checklist

Before marking as fixed:
- [ ] New contract deployed to Arc Testnet
- [ ] Contract address updated in constants
- [ ] Build passes (`npm run build`)
- [ ] Job creation works (USDC deducted)
- [ ] Job appears in dashboard
- [ ] `jobCount()` increments correctly
- [ ] Transaction shows on explorer
- [ ] No console errors

---

## 🔧 How to Verify Current Deployment

### Check what's actually deployed:

1. **Go to Arc Testnet Explorer:**
   ```
   https://testnet.arcscan.network/address/0x07191A01Ab724aA7c59F272946E533ec142d7E0F
   ```

2. **Check Contract Tab:**
   - Look for `createJob` function
   - Check parameter types
   - If it shows `createJob(address, uint256)` → OLD contract
   - If it shows `createJob(uint256, string, string[])` → NEW contract

3. **Check Read Contract:**
   - Call `jobCount()` to see current count
   - Call `getJob(0)` to see if any jobs exist

---

## 📊 Contract Comparison

| Feature | OLD FreelancerEscrow | NEW FreelancerMarketplace |
|---------|---------------------|---------------------------|
| **createJob params** | `(address, uint256)` | `(uint256, string, string[])` |
| **Job assignment** | Direct (at creation) | Application-based |
| **Job description** | ❌ No | ✅ Yes |
| **Required skills** | ❌ No | ✅ Yes |
| **Applications** | ❌ No | ✅ Yes |
| **Applicant list** | ❌ No | ✅ Yes |
| **Job states** | 5 states | 6 states |
| **State names** | FUNDED, SUBMITTED, etc. | OPEN, ASSIGNED, etc. |

---

## 🚀 Expected Behavior After Fix

1. User fills job form (amount, description, skills)
2. User approves USDC
3. User confirms job creation
4. **USDC is deducted from wallet** ✅
5. **Job is created on-chain** ✅
6. **jobCount increments** ✅
7. **Job appears in dashboard** ✅
8. **Transaction visible on explorer** ✅

---

## 📝 Notes

- The frontend code is correct for FreelancerMarketplace
- The deployed contract is FreelancerEscrow (old version)
- This mismatch has been present since deployment
- All 7 frontend features were built for the marketplace model
- The spec documents describe the marketplace model

**Conclusion:** Deploy the NEW FreelancerMarketplace contract to match the frontend.

---

**Report Created:** May 6, 2026  
**Identified By:** Kiro AI  
**Priority:** P0 - Blocking all job creation
