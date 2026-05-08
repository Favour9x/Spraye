# ⚠️ IMPORTANT: Vercel Environment Variable Update Required

## Issue
Your live site is still showing old jobs because Vercel is using the old contract address. The `.env.local` file is not pushed to GitHub (it's in `.gitignore` for security), so Vercel doesn't automatically get the updated contract address.

## Current Status
- ✅ **Local Code:** Updated to new contract `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`
- ✅ **GitHub:** All code pushed with new contract address
- ❌ **Vercel:** Still using old contract address (needs manual update)

## Solution: Update Vercel Environment Variable

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: **Spraye**

### Step 2: Update Environment Variable
1. Click **Settings** (in the top navigation)
2. Click **Environment Variables** (in the left sidebar)
3. Find the variable: `NEXT_PUBLIC_ESCROW_ADDRESS`
4. Click the **Edit** button (pencil icon) next to it
5. Update the value to: `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`
6. Make sure it's enabled for: **Production**, **Preview**, and **Development**
7. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab (in the top navigation)
2. Find the latest deployment
3. Click the **...** (three dots) menu button
4. Click **Redeploy**
5. Confirm the redeploy

### Step 4: Wait for Deployment
- Deployment takes 2-3 minutes
- Watch the deployment logs to ensure it completes successfully
- You'll see a green checkmark when it's done

### Step 5: Verify
1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Visit your live site
3. Open browser console (F12)
4. Check that the contract address is: `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`
5. Try creating a new job - it should use the V2 contract

---

## Alternative: Test Locally First

Your local dev server is already running with the new contract:
- **URL:** http://localhost:3000
- **Contract:** `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`

Test all features locally to ensure everything works before updating Vercel.

---

## What Happens After Update

### Old Jobs (V1 Contract)
- Jobs from the old contract will no longer be visible
- Old contract address: `0x6e1859b89fc09c291C7a898aC2F4830804B23AA8`
- If you need to access old jobs, you can temporarily switch back

### New Jobs (V2 Contract)
- All new jobs will use the V2 contract
- GitHub usernames stored onchain
- Application deadlines enforced
- Transfer confirmation with proof links
- All V2 features available

---

## Troubleshooting

### If Vercel Deployment Fails
1. Check the deployment logs for errors
2. Ensure the environment variable is exactly: `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`
3. Make sure there are no extra spaces or characters
4. Try redeploying again

### If Site Still Shows Old Jobs
1. Clear browser cache completely
2. Try in incognito/private browsing mode
3. Check browser console for the contract address being used
4. Verify Vercel deployment completed successfully

### If You Need to Access Old Jobs
Temporarily change the environment variable back to:
`0x6e1859b89fc09c291C7a898aC2F4830804B23AA8`

Then redeploy. You can switch between contracts as needed.

---

## Summary

**Action Required:** Update `NEXT_PUBLIC_ESCROW_ADDRESS` in Vercel Dashboard

**New Value:** `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`

**Steps:**
1. Vercel Dashboard → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_ESCROW_ADDRESS`
3. Set to new contract address
4. Save
5. Deployments → Redeploy latest
6. Wait 2-3 minutes
7. Clear browser cache and test

**Local Testing:** http://localhost:3000 (already running with new contract)
