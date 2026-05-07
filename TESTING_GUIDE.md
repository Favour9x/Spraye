# Testing Guide - Verify New Changes Are Working

## Step 1: Clear Browser Cache
1. Open your browser's DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload" (or press Ctrl+Shift+R)
4. This ensures you're loading the NEW JavaScript with all the updates

## Step 2: Verify Contract Address
1. Open browser console (F12 → Console tab)
2. Look for this log message:
   ```
   🔍 FREELANCER_ESCROW_ADDRESS: 0x6e1859b89fc09c291C7a898aC2F4830804B23AA8
   ```
3. If you see the OLD address (`0xe305ACFE...`), the cache wasn't cleared properly

## Step 3: Test Transfer Request Flow

### As Client:
1. Go to a job in SUBMITTED state
2. You should see:
   - ✅ Checklist with 3 checkboxes
   - ✅ "Request Repo Transfer" button appears AFTER checking first checkbox
   - ✅ Platform fee notice: "A 5% platform fee is deducted..."
3. Check the first checkbox
4. Click "Request Repo Transfer from Freelancer"
5. Confirm the wallet transaction
6. You should see: "✓ Transfer Requested — waiting for freelancer to confirm"

### As Freelancer:
1. Go to the same job page
2. **BEFORE client requests transfer:**
   - You should see: "Waiting for Client Review"
   - Message says: "This page automatically checks for updates every 15 seconds"
3. **AFTER client requests transfer (wait up to 15 seconds):**
   - Page should automatically update
   - You should see: "Repo Transfer Requested" with full instructions
   - Transfer instructions with GitHub username should appear
   - Imgur link input field should appear

## Step 4: Debug if Freelancer Page Doesn't Update

### Check Browser Console:
1. Open DevTools (F12) → Console tab
2. Look for any errors related to:
   - `useReadContract`
   - `getJob`
   - Contract address

### Check Network Tab:
1. Open DevTools (F12) → Network tab
2. Filter by "WS" (WebSocket) or "Fetch/XHR"
3. Look for blockchain RPC calls every 15 seconds

### Manual Verification:
1. Open browser console
2. Type this to check the job state:
   ```javascript
   // This will show you the current job state from the blockchain
   console.log('Checking job state...');
   ```
3. The state should be `3` (TRANSFER_REQUESTED) after client requests transfer

## Step 5: Verify Blockchain State

### Using ArcScan:
1. Go to: https://testnet.arcscan.network/address/0x6e1859b89fc09c291C7a898aC2F4830804B23AA8
2. Click "Read Contract"
3. Find `getJob` function
4. Enter your job ID
5. Check the `state` field:
   - `2` = SUBMITTED (before transfer request)
   - `3` = TRANSFER_REQUESTED (after transfer request)

## Common Issues

### Issue 1: Freelancer page still shows "Waiting for Client Review"
**Cause:** Browser cache not cleared or old contract address
**Fix:** 
- Hard refresh (Ctrl+Shift+R)
- Check console for contract address
- Verify you're using the NEW contract

### Issue 2: "Request Repo Transfer" button doesn't appear
**Cause:** Old JavaScript cached
**Fix:**
- Clear browser cache completely
- Close and reopen browser
- Try incognito/private mode

### Issue 3: Job state is still 2 (SUBMITTED) after clicking button
**Cause:** Transaction failed or not confirmed
**Fix:**
- Check wallet for transaction confirmation
- Check ArcScan for transaction status
- Verify you have enough USDC for gas

## Expected Behavior Summary

| Action | Client Sees | Freelancer Sees | Blockchain State |
|--------|-------------|-----------------|------------------|
| Work submitted | Review checklist | "Waiting for Client Review" | 2 (SUBMITTED) |
| Client checks box 1 | "Request Transfer" button appears | "Waiting for Client Review" | 2 (SUBMITTED) |
| Client clicks button | "✓ Transfer Requested" message | "Waiting for Client Review" | 3 (TRANSFER_REQUESTED) |
| After 0-15 seconds | "✓ Transfer Requested" message | **Transfer instructions appear** | 3 (TRANSFER_REQUESTED) |
| Freelancer confirms | Third checkbox auto-checks | "✓ Transfer confirmed" | 3 (TRANSFER_REQUESTED) |
| Client approves | Payment released | Payment received | 4 (APPROVED) |

## Quick Test Commands

### Check if dev server is running:
```bash
curl http://localhost:3000
```

### Check contract address in code:
```bash
grep -r "0x6e1859b89fc09c291C7a898aC2F4830804B23AA8" frontend/src/
```

### Restart dev server:
```bash
cd frontend
npm run dev
```

## Still Not Working?

If the freelancer page still doesn't update after following all steps:

1. **Stop the dev server** (Ctrl+C in terminal)
2. **Clear Next.js cache:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```
3. **Clear browser completely:**
   - Close all browser tabs
   - Clear all browsing data
   - Reopen browser in incognito mode
4. **Test with a NEW job:**
   - Create a brand new job with the new contract
   - Submit work as freelancer
   - Request transfer as client
   - Check if freelancer page updates

---

**Need Help?** Check the browser console for errors and share them for debugging.
