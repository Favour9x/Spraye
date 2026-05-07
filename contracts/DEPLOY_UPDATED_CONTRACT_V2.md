# Deploy Updated FreelancerMarketplace Contract V2

## Contract Updates Summary

### New Features Added:
1. **GitHub Username Storage** - Stored onchain per jobId
2. **Transfer Confirmation** - `confirmTransfer()` function with proof link storage
3. **Adjustable Platform Fee** - `setPlatformFee()` function (default 5%)
4. **Application Deadline** - Stored per job
5. **Estimated Delivery Time** - Stored per application

### All Previous Features Included:
- TRANSFER_REQUESTED job state (index 3)
- `requestTransfer()` function
- 5% platform fee (now adjustable)
- 1 USDC dispute fee
- Platform wallet: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689

## Deployment Steps in Remix

### 1. Open Remix IDE
Go to https://remix.ethereum.org

### 2. Create New File
- Click "contracts" folder
- Create new file: `FreelancerMarketplace.sol`
- Copy the entire updated contract code into this file

### 3. Compile Contract
- Go to "Solidity Compiler" tab (left sidebar)
- Select compiler version: `0.8.24`
- Click "Compile FreelancerMarketplace.sol"
- Ensure no errors

### 4. Deploy Contract
- Go to "Deploy & Run Transactions" tab
- Environment: Select "Injected Provider - MetaMask"
- Ensure MetaMask is connected to **Arc Testnet** (Chain ID: 5042002)
- Contract: Select "FreelancerMarketplace"

### 5. Constructor Parameters
Enter these values in order:

```
_arbitrator: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
_usdc: 0x3600000000000000000000000000000000000000
_reputationRegistry: 0x8004B663056A597Dffe9eCcC1965A193B7388713
_platformWallet: 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
```

### 6. Deploy
- Click "Deploy" button
- Confirm transaction in MetaMask
- Wait for confirmation
- Copy the deployed contract address

### 7. Verify Deployment
After deployment, verify these public variables:
- `arbitrator()` → 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
- `platformWallet()` → 0x06ca85E556d53bb2A54a99D8cA546Fe927beB689
- `platformFeePercent()` → 5
- `DISPUTE_FEE()` → 1000000

### 8. Update Frontend
Update the contract address in:
- `frontend/src/constants/index.ts`
- `frontend/.env.local`

## New Contract Functions

### For Job Creation:
```solidity
createJob(
    uint256 amount,
    string description,
    string[] requiredSkills,
    string githubUsername,  // NEW
    uint256 deadline        // NEW
)
```

### For Applications:
```solidity
applyForJob(
    uint256 jobId,
    string proposal,
    string estimatedDelivery  // NEW
)
```

### For Transfer Confirmation:
```solidity
confirmTransfer(
    uint256 jobId,
    string imgurLink  // NEW
)
```

### For Platform Fee Adjustment:
```solidity
setPlatformFee(uint256 newFeePercent)  // NEW - Only platformWallet can call
```

### New Read Functions:
```solidity
getGithubUsername(uint256 jobId) returns (string)
getTransferProofLink(uint256 jobId) returns (string)
jobGithubUsernames(uint256 jobId) returns (string)  // Public mapping
transferProofLinks(uint256 jobId) returns (string)  // Public mapping
```

## Testing Checklist

After deployment, test:
- [ ] Create job with GitHub username
- [ ] Verify GitHub username is stored onchain
- [ ] Apply for job with estimated delivery
- [ ] Assign freelancer
- [ ] Submit work
- [ ] Request transfer
- [ ] Confirm transfer with imgur link
- [ ] Verify proof link is stored onchain
- [ ] Approve work and verify fee breakdown
- [ ] Test setPlatformFee (only platformWallet)

## Notes

- The contract is backward compatible with existing jobs
- Platform fee is adjustable but defaults to 5%
- GitHub username and proof links are stored onchain
- Application deadline is enforced on frontend
- All previous features remain functional
