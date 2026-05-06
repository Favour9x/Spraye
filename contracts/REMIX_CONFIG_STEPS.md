# 🔧 Remix IDE Configuration - Enable via IR

## The Problem
Remix shows: "UnimplementedFeatureError: Copying nested calldata dynamic arrays to storage is not implemented in the old code generator."

## The Solution
Enable the new IR-based code generator using a configuration file.

---

## 📋 Step-by-Step Instructions

### Step 1: Create Configuration File
1. In Remix file explorer (left sidebar)
2. Click the "+" icon to create a new file
3. Name it: **`.remix-compiler.config.json`** (note the dot at the start!)
4. Press Enter

### Step 2: Paste Configuration
Copy and paste this EXACT JSON into the file:

```json
{
  "language": "Solidity",
  "settings": {
    "optimizer": {
      "enabled": true,
      "runs": 200
    },
    "outputSelection": {
      "*": {
        "*": [
          "abi",
          "evm.bytecode",
          "evm.deployedBytecode",
          "evm.methodIdentifiers",
          "metadata"
        ],
        "": [
          "ast"
        ]
      }
    },
    "viaIR": true
  }
}
```

### Step 3: Save the File
- Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
- Or click the save icon

### Step 4: Enable Configuration File
1. Go to "Solidity Compiler" tab (left sidebar)
2. Select compiler version: **0.8.24**
3. Click "Advanced Configurations"
4. Check ✅ **"Use configuration file"**

### Step 5: Compile
1. Click "Compile FreelancerMarketplace.sol"
2. Wait 30-60 seconds (IR compilation is slower than normal)
3. ✅ Should compile successfully with no errors!

---

## ✅ Verification

After compilation, you should see:
- ✅ Green checkmark next to "Solidity Compiler"
- ✅ No red error messages
- ✅ Contract appears in "Deploy & Run Transactions" dropdown

---

## 🔍 What This Does

The `"viaIR": true` setting tells Solidity to use the new **Intermediate Representation (IR)** based code generator, which:
- Handles complex data structures better
- Supports copying calldata arrays to storage
- Produces more optimized bytecode
- Is the future of Solidity compilation

---

## ⚠️ Troubleshooting

### "Configuration file not found"
- Make sure the file name starts with a dot: `.remix-compiler.config.json`
- Make sure it's in the root directory (not in a subfolder)

### Still getting the same error
- Make sure "Use configuration file" is checked
- Try refreshing Remix (F5)
- Delete the `.remix-compiler.config.json` and create it again

### Compilation takes forever
- IR compilation is slower (30-60 seconds is normal)
- Don't interrupt it - let it finish

### "Invalid JSON"
- Make sure you copied the entire JSON exactly
- Check for missing commas or brackets
- Use a JSON validator: https://jsonlint.com

---

## 📝 Alternative: Hardhat/Foundry

If Remix continues to have issues, you can compile using:

**Hardhat:**
```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
```

**Foundry:**
```toml
# foundry.toml
[profile.default]
solc_version = "0.8.24"
via_ir = true
optimizer = true
optimizer_runs = 200
```

---

## 🎯 Quick Reference

**File name:** `.remix-compiler.config.json`  
**Location:** Root directory in Remix  
**Key setting:** `"viaIR": true`  
**Compiler version:** 0.8.24 or higher  
**Compilation time:** 30-60 seconds  

---

**Last Updated:** May 6, 2026  
**Tested On:** Remix IDE (latest version)
