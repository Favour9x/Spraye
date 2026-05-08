# ArcHire - Trustless Freelancing on Arc Testnet

A decentralized freelance marketplace built on Arc Testnet with USDC escrow, smart contract automation, and onchain reputation tracking via ERC-8004 integration.

## 🌟 Live Demo

**Frontend:** [https://archire.spraye.vercel.app](https://archire.spraye.vercel.app)  
**Contract:** `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133` ([View on Explorer](https://testnet.arcscan.network/address/0xEc6e1172649e4E90CA86eE0CaF6a207970B83133))

## ✨ Key Features

### 🔒 Secure Escrow System
- **USDC Custody** — Client funds locked in smart contract until work approved
- **Automated Payments** — Instant release upon approval (2-5 seconds)
- **Dispute Resolution** — Fair arbitration system with 1 USDC dispute fee
- **Platform Fee** — Adjustable 1-5% fee (currently set by platform wallet)

### 🎯 Complete Workflow
1. **Job Creation** — Client posts job with USDC amount, description, skills, GitHub username, and application deadline
2. **Freelancer Applications** — Freelancers submit proposals with estimated delivery time
3. **Assignment** — Client reviews proposals and assigns freelancer
4. **Work Submission** — Freelancer submits demo link
5. **Repo Transfer** — Client requests GitHub repo transfer, freelancer confirms with proof
6. **Approval & Payment** — Client approves work, payment released automatically

### 🚀 Advanced Features
- **Application Deadlines** — Jobs close after 24h/48h/3d/7d (client choice)
- **Estimated Delivery** — Freelancers specify delivery timeline when applying
- **Transfer Confirmation** — Freelancers submit imgur proof of GitHub repo transfer (stored onchain)
- **Real-time Notifications** — Event-based notifications for all actions (polls every 30s)
- **Notification Bell** — Red dot indicator with unread count
- **Transfer Proof Polling** — Client sees freelancer's transfer confirmation automatically (polls every 15s)
- **ERC-8004 Reputation** — Onchain reputation scores for completed jobs
- **Skills Matching** — Filter jobs by required skills
- **Deadline Countdown** — Visual countdown timer on job cards

### 🎨 Modern UI/UX
- **Glassmorphism Design** — Beautiful frosted glass effects throughout
- **Dark Mode** — Sleek dark theme optimized for readability
- **Responsive Layout** — Works perfectly on desktop, tablet, and mobile
- **Loading States** — Clear feedback during blockchain transactions
- **Transaction Notifications** — Real-time tx status with explorer links
- **Empty States** — Helpful messages when no data available

### 👥 Role-Based Dashboards
- **Client Dashboard** — Create jobs, review proposals, approve work, manage disputes
- **Freelancer Dashboard** — Browse jobs, submit proposals, deliver work, confirm transfers
- **Arbitrator Dashboard** — Resolve disputes, view all disputed jobs, adjust platform fee

## 🏗️ Architecture

### Smart Contract (`FreelancerMarketplace.sol`)
- **7-State Machine** — OPEN → ASSIGNED → SUBMITTED → TRANSFER_REQUESTED → APPROVED / DISPUTED → RESOLVED
- **USDC Integration** — ERC-20 interface with 6 decimals
- **ERC-8004 Reputation** — Automatic reputation updates on job completion
- **Custom Errors** — Gas-efficient error handling
- **Events** — Comprehensive event emission for frontend tracking
- **Security** — Reentrancy guards, access control, input validation

### Frontend Stack
- **Framework** — Next.js 14 with App Router
- **Language** — TypeScript for type safety
- **Styling** — Tailwind CSS with custom glassmorphism utilities
- **Web3** — wagmi v2 + viem v2 + RainbowKit v2
- **State Management** — React Query for blockchain data caching
- **Animations** — Framer Motion for smooth transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Arc Testnet USDC (get from [Circle Faucet](https://faucet.circle.com))

### 1. Clone Repository
```bash
git clone https://github.com/Favour9x/Spraye.git
cd Spraye
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Connect to Arc Testnet
Add Arc Testnet to MetaMask:
- **Network Name:** Arc Testnet
- **RPC URL:** https://rpc.testnet.arc.network
- **Chain ID:** 5042002
- **Currency Symbol:** USDC
- **Block Explorer:** https://testnet.arcscan.network

## 📖 User Guide

### For Clients

1. **Create a Job**
   - Click "Post Job" in navigation
   - Enter USDC amount (e.g., 100 USDC)
   - Write detailed job description
   - Add required skills (comma-separated)
   - Enter your GitHub username (for code projects)
   - Select application deadline (24h - 7 days)
   - Approve USDC spending (one-time)
   - Confirm job creation transaction

2. **Review Proposals**
   - Go to "My Jobs" → Click on your job
   - View all freelancer proposals
   - Check estimated delivery times
   - Select "Assign Freelancer" for your choice

3. **Review Work**
   - Freelancer submits demo link
   - Check the first checkbox after reviewing demo
   - Click "Request Repo Transfer from Freelancer"
   - Wait for freelancer to confirm transfer (polls every 15s)
   - When proof link appears, click "View Transfer Proof"
   - Verify repo is in your GitHub account
   - Check all three checkboxes manually
   - Click "Approve Work" to release payment

4. **Raise Dispute** (if needed)
   - Click "Raise Dispute" instead of approve
   - Pay 1 USDC dispute fee
   - Describe the issue clearly
   - Arbitrator will review and resolve

### For Freelancers

1. **Browse Jobs**
   - Visit "Browse Jobs" page
   - Filter by skills if needed
   - Check application deadlines (countdown timer)
   - Click job to view full details

2. **Apply for Job**
   - Click "Apply for This Job"
   - Write your proposal
   - Select estimated delivery time
   - Submit application

3. **Deliver Work**
   - After being assigned, submit your demo link
   - Wait for client to request repo transfer
   - Transfer GitHub repo to client's username
   - Upload screenshot to imgur.com
   - Paste imgur link and click "Confirm Transfer Sent"
   - **MetaMask popup will appear** — confirm transaction
   - Wait for confirmation (shows loading state)
   - Success message appears when confirmed

4. **Get Paid**
   - Client approves work
   - Payment released automatically to your wallet
   - Reputation score updated onchain

### For Arbitrators

1. **Access Dashboard**
   - Connect with arbitrator wallet
   - Visit "Arbitrator" page
   - View all disputed jobs

2. **Resolve Disputes**
   - Review job description
   - Check submitted work
   - Read dispute reason
   - Click "Resolve for Freelancer" or "Resolve for Client"
   - Funds distributed based on decision

3. **Adjust Platform Fee** (Platform Wallet Only)
   - View current fee percentage
   - Enter new fee (0-100%)
   - Click "Update Platform Fee"
   - Confirm transaction

## 🔧 Technical Details

### Contract Addresses (Arc Testnet)
- **FreelancerMarketplace:** `0xEc6e1172649e4E90CA86eE0CaF6a207970B83133`
- **USDC:** `0x3600000000000000000000000000000000000000`
- **Reputation Registry (ERC-8004):** `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- **Arbitrator:** `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`
- **Platform Wallet:** `0x06ca85E556d53bb2A54a99D8cA546Fe927beB689`

### Job States
```solidity
enum JobState {
    OPEN,                  // 0 - Job created, accepting applications
    ASSIGNED,              // 1 - Freelancer assigned
    SUBMITTED,             // 2 - Work submitted by freelancer
    TRANSFER_REQUESTED,    // 3 - Client requested repo transfer
    DISPUTED,              // 4 - Dispute raised
    APPROVED,              // 5 - Work approved, payment released
    RESOLVED               // 6 - Dispute resolved
}
```

### Key Contract Functions
- `createJob(amount, description, skills, githubUsername, deadline)` — Create new job
- `applyForJob(jobId, proposal, estimatedDelivery)` — Submit application
- `assignFreelancer(jobId, freelancer)` — Assign freelancer to job
- `submitWork(jobId, deliverable)` — Submit work demo link
- `requestTransfer(jobId)` — Request GitHub repo transfer
- `confirmTransfer(jobId, imgurLink)` — Confirm transfer with proof
- `approveWork(jobId)` — Approve work and release payment
- `raiseDispute(jobId)` — Raise dispute (1 USDC fee)
- `resolveDispute(jobId, favorFreelancer)` — Arbitrator resolves dispute
- `setPlatformFee(newFeePercent)` — Adjust platform fee (platform wallet only)

### Frontend Hooks
- `useCreateJob` — Create job with USDC approval
- `useApplyForJob` — Submit job application
- `useAssignFreelancer` — Assign freelancer to job
- `useSubmitWork` — Submit work deliverable
- `useRequestTransfer` — Request repo transfer
- `useConfirmTransfer` — Confirm transfer with proof (calls contract)
- `useApproveWork` — Approve work and release payment
- `useRaiseDispute` — Raise dispute with fee
- `useResolveDispute` — Resolve dispute (arbitrator)
- `useSetPlatformFee` — Adjust platform fee
- `useNotifications` — Poll contract events for notifications
- `useTransferProofLink` — Poll for transfer proof link
- `useGithubUsername` — Fetch GitHub username from contract

## 📁 Project Structure

```
.
├── contracts/
│   ├── FreelancerMarketplace.sol      # Main smart contract
│   ├── FreelancerEscrow.sol           # Legacy contract (V1)
│   └── DEPLOYMENT.md                  # Deployment guide
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── jobs/                  # Job browsing & creation
│   │   │   ├── my-jobs/               # User's jobs dashboard
│   │   │   ├── profile/               # User profile
│   │   │   ├── arbitrator/            # Arbitrator dashboard
│   │   │   ├── notifications/         # Notifications page
│   │   │   └── how-it-works/          # Info page
│   │   ├── components/
│   │   │   ├── ActionButtons.tsx      # Job action buttons
│   │   │   ├── CreateJobForm.tsx      # Job creation form
│   │   │   ├── JobCard.tsx            # Job list card
│   │   │   ├── JobDetail.tsx          # Job detail view
│   │   │   ├── ApplicationsList.tsx   # Proposals list
│   │   │   ├── ApplyForJobForm.tsx    # Application form
│   │   │   ├── SubmitWorkForm.tsx     # Work submission
│   │   │   ├── FreelancerTransferConfirmation.tsx  # Transfer confirmation
│   │   │   ├── Navigation.tsx         # Top navigation
│   │   │   └── TxNotification.tsx     # Transaction status
│   │   ├── lib/
│   │   │   ├── hooks/                 # Custom wagmi hooks
│   │   │   ├── wagmi.ts               # wagmi configuration
│   │   │   ├── contracts.ts           # Contract ABIs
│   │   │   └── utils.ts               # Utility functions
│   │   └── constants/
│   │       └── index.ts               # Contract addresses & constants
│   ├── .env.local                     # Environment variables
│   └── package.json
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Blue:** `#0052FF` — Buttons, links, accents
- **Background:** `#0A0A0A` — Main background
- **Glass Cards:** Frosted glass effect with backdrop blur
- **Text:** White primary, gray-400 secondary

### Components
- **Glass Cards** — Backdrop blur with border and shadow
- **Hover Effects** — Smooth scale and color transitions
- **Loading States** — Skeleton loaders and spinners
- **Toast Notifications** — Success/error messages
- **Modal Dialogs** — Centered overlays with backdrop

## 🔐 Security Features

- **Reentrancy Protection** — All state-changing functions protected
- **Access Control** — Role-based permissions (client, freelancer, arbitrator)
- **Input Validation** — Length limits, amount checks, address validation
- **Safe Math** — Solidity 0.8+ built-in overflow protection
- **Event Logging** — All actions emit events for transparency
- **Dispute Fee** — 1 USDC fee prevents spam disputes

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create job with USDC approval
- [ ] Apply for job as freelancer
- [ ] Assign freelancer as client
- [ ] Submit work as freelancer
- [ ] Request transfer as client
- [ ] Confirm transfer as freelancer (MetaMask popup)
- [ ] View transfer proof as client (polls every 15s)
- [ ] Approve work as client
- [ ] Verify payment received
- [ ] Raise dispute and resolve as arbitrator
- [ ] Check notifications (polls every 30s)
- [ ] Test application deadline countdown
- [ ] Test platform fee adjustment

## 🚧 Known Limitations

- **Arc Testnet Only** — Not deployed to mainnet
- **Single Arbitrator** — Centralized arbitration (could be DAO in future)
- **No Milestone Payments** — Single payment per job
- **No Escrow Refunds** — Client can't cancel after assignment (dispute only)
- **GitHub Transfer Manual** — Relies on freelancer honesty (verified via proof link)

## 🛣️ Roadmap

- [ ] Multi-milestone payments
- [ ] Decentralized arbitration (DAO voting)
- [ ] Freelancer profiles with portfolio
- [ ] Client reviews and ratings
- [ ] Job categories and advanced filtering
- [ ] Direct messaging between parties
- [ ] Escrow cancellation with penalties
- [ ] Mainnet deployment

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live App:** [https://archire.spraye.vercel.app](https://archire.spraye.vercel.app)
- **Contract Explorer:** [View on ArcScan](https://testnet.arcscan.network/address/0xEc6e1172649e4E90CA86eE0CaF6a207970B83133)
- **Arc Testnet Docs:** [https://docs.arc.network](https://docs.arc.network)
- **Circle Faucet:** [https://faucet.circle.com](https://faucet.circle.com)
- **GitHub:** [https://github.com/Favour9x/Spraye](https://github.com/Favour9x/Spraye)

## 💬 Support

For questions or issues:
- Open a GitHub issue
- Check Arc Network Discord
- Review contract on ArcScan

---

**Built with ❤️ on Arc Testnet**
