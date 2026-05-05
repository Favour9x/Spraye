# Implementation Plan: ArcHire Freelancer Marketplace

## Overview

Implement **ArcHire**, a decentralized freelance marketplace on Arc Testnet (Chain ID 5042002). The system consists of a Solidity smart contract (`FreelancerMarketplace.sol`) deployed at `0x07191A01Ab724aA7c59F272946E533ec142d7E0F` that enables job postings with descriptions and required skills, freelancer applications with proposals, client-driven freelancer selection, USDC escrow, and dispute resolution. The frontend is a Next.js 14 app with a dark theme and electric blue (#0052FF) accent, using wagmi v2, RainbowKit, and viem for wallet connectivity. There is no backend — all state lives onchain.

## Tasks

- [x] 1. Scaffold Foundry smart contract project
  - Run `forge init` to create the Foundry project structure
  - Create `foundry.toml` with `[fuzz] runs = 256` and `seed = "0x1"` fuzz configuration
  - Add `forge-std` as a dependency (included by default with `forge init`)
  - Create the directory structure: `contracts/`, `test/`, `test/mocks/`, `test/helpers/`, `script/`
  - Create a `.env.example` file with `PRIVATE_KEY=`, `ARBITRATOR_ADDRESS=`, and `RPC_URL=https://rpc.testnet.arc.network`
  - _Requirements: 1.1_

- [x] 2. Implement `FreelancerMarketplace.sol` core contract
  - [x] 2.1 Define custom errors, enums, structs, and events
    - Add all custom errors: `ZeroAmount`, `ZeroAddress`, `SelfAssignment`, `DescriptionEmpty`, `DescriptionTooLong`, `DeliverableEmpty`, `DeliverableTooLong`, `NotFreelancer`, `NotClient`, `NotArbitrator`, `InvalidState`, `JobNotFound`, `AlreadyApplied`, `NoApplications`, `ApplicationNotFound`, `TransferFailed`, `TooManySkills`
    - Define `JobState` enum: `OPEN`, `ASSIGNED`, `SUBMITTED`, `APPROVED`, `DISPUTED`, `RESOLVED`
    - Define `Job` struct with fields: `id`, `client`, `freelancer`, `amount`, `state`, `description`, `requiredSkills`, `deliverable`, `applicationCount`
    - Define `Application` struct with fields: `freelancer`, `proposal`, `timestamp`
    - Declare all seven events: `JobCreated`, `JobApplicationSubmitted`, `FreelancerAssigned`, `WorkSubmitted`, `JobApproved`, `DisputeRaised`, `DisputeResolved`
    - _Requirements: 1.7, 2.5, 3.7, 4.6, 5.4, 6.4, 7.5_

  - [x] 2.2 Implement constructor and storage layout
    - Declare `address public immutable arbitrator`, `IERC20 public immutable usdc`, `IReputationRegistry public immutable reputationRegistry`
    - Declare `uint256 private _jobCount`, `mapping(uint256 => Job) private _jobs`, `mapping(uint256 => mapping(address => Application)) private _applications`, `mapping(uint256 => address[]) private _applicants`
    - Declare constants: `uint256 public constant MAX_DESCRIPTION_LENGTH = 2048`, `uint256 public constant MAX_DELIVERABLE_LENGTH = 2048`, `uint256 public constant MAX_SKILLS = 10`
    - Implement constructor that accepts `address _arbitrator`, `address _usdc`, `address _reputationRegistry` and sets immutables; revert with `ZeroAddress` if any argument is the zero address
    - _Requirements: 8.3, 8.4_

  - [x] 2.3 Implement `createJob(uint256 amount, string calldata description, string[] calldata requiredSkills)`
    - Revert with `ZeroAmount` if `amount == 0`
    - Revert with `DescriptionEmpty` if `bytes(description).length == 0`
    - Revert with `DescriptionTooLong` if `bytes(description).length > MAX_DESCRIPTION_LENGTH`
    - Revert with `TooManySkills` if `requiredSkills.length > MAX_SKILLS`
    - Call `usdc.transferFrom(msg.sender, address(this), amount)`; revert with `TransferFailed` if it returns false
    - Store the new `Job` in `_jobs[_jobCount]` with `state = JobState.OPEN`, `freelancer = address(0)`, empty `deliverable`, and `applicationCount = 0`
    - Emit `JobCreated(jobId, msg.sender, amount, description, requiredSkills)`
    - Increment `_jobCount` and return the new job ID
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.4 Implement `applyForJob(uint256 jobId, string calldata proposal)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.OPEN`
    - Revert with `SelfAssignment` if `msg.sender == job.client`
    - Revert with `AlreadyApplied` if `_applications[jobId][msg.sender].freelancer != address(0)`
    - Store the application in `_applications[jobId][msg.sender]` with `freelancer = msg.sender`, `proposal`, and `timestamp = block.timestamp`
    - Add `msg.sender` to `_applicants[jobId]` array
    - Increment `job.applicationCount`
    - Emit `JobApplicationSubmitted(jobId, msg.sender, proposal)`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.5 Implement `assignFreelancer(uint256 jobId, address freelancer)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.OPEN`
    - Revert with `NotClient` if `msg.sender != job.client`
    - Revert with `ApplicationNotFound` if `_applications[jobId][freelancer].freelancer == address(0)`
    - Update `job.freelancer = freelancer` and `job.state = JobState.ASSIGNED`
    - Emit `FreelancerAssigned(jobId, freelancer)`
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 2.6 Implement `submitWork(uint256 jobId, string calldata deliverable)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.ASSIGNED`
    - Revert with `NotFreelancer` if `msg.sender != job.freelancer`
    - Revert with `DeliverableEmpty` if `bytes(deliverable).length == 0`
    - Revert with `DeliverableTooLong` if `bytes(deliverable).length > MAX_DELIVERABLE_LENGTH`
    - Update `job.state = JobState.SUBMITTED` and `job.deliverable = deliverable`
    - Emit `WorkSubmitted(jobId, deliverable)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 2.7 Implement `approveWork(uint256 jobId)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.SUBMITTED`
    - Revert with `NotClient` if `msg.sender != job.client`
    - Update `job.state = JobState.APPROVED`
    - Call `usdc.transfer(job.freelancer, job.amount)`; revert with `TransferFailed` if it returns false
    - Wrap `reputationRegistry.giveFeedback(0, 1, 0, "marketplace", "", "", "", bytes32(0))` in a `try {} catch {}` block
    - Emit `JobApproved(jobId, job.freelancer, job.amount)`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.8 Implement `raiseDispute(uint256 jobId)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.SUBMITTED`
    - Revert with `NotClient` if `msg.sender != job.client`
    - Update `job.state = JobState.DISPUTED`
    - Emit `DisputeRaised(jobId, msg.sender)`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.9 Implement `resolveDispute(uint256 jobId, bool favorFreelancer)`
    - Revert with `JobNotFound` if `jobId >= _jobCount`
    - Revert with `InvalidState` if `job.state != JobState.DISPUTED`
    - Revert with `NotArbitrator` if `msg.sender != arbitrator`
    - Update `job.state = JobState.RESOLVED`
    - If `favorFreelancer`: call `usdc.transfer(job.freelancer, job.amount)` and wrap `reputationRegistry.giveFeedback(...)` in `try {} catch {}`; set `recipient = job.freelancer`
    - If `!favorFreelancer`: call `usdc.transfer(job.client, job.amount)`; set `recipient = job.client`
    - Revert with `TransferFailed` if the transfer returns false
    - Emit `DisputeResolved(jobId, msg.sender, recipient, job.amount)`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.10 Implement read functions: `getJob`, `getApplicants`, `getApplication`, `jobCount`, `arbitrator`
    - `getJob(uint256 jobId)`: revert with `JobNotFound` if `jobId >= _jobCount`; otherwise return `_jobs[jobId]`
    - `getApplicants(uint256 jobId)`: revert with `JobNotFound` if `jobId >= _jobCount`; otherwise return `_applicants[jobId]`
    - `getApplication(uint256 jobId, address freelancer)`: revert with `JobNotFound` if `jobId >= _jobCount`; otherwise return `_applications[jobId][freelancer]`
    - `jobCount()`: return `_jobCount`
    - `arbitrator()` is already exposed as a public immutable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 3.1, 3.2_

- [ ] 3. Write smart contract test infrastructure
  - [ ] 3.1 Create `MockUSDC.sol` — a minimal ERC-20 with `mint(address, uint256)` for test setup
    - Implement standard `transfer`, `transferFrom`, `approve`, `allowance`, `balanceOf`
    - Add `mint(address to, uint256 amount)` callable by anyone (test-only)
    - _Requirements: 1.1_

  - [ ] 3.2 Create `MockReputationRegistry.sol` — always reverts on `giveFeedback`
    - Implement `giveFeedback(uint256, int128, uint8, string calldata, string calldata, string calldata, string calldata, bytes32)` that unconditionally reverts
    - Used to verify Property 12: ERC-8004 failure never blocks payment
    - _Requirements: 5.5, 7.6_

  - [ ] 3.3 Create `MarketplaceTestBase.sol` — shared setup helper
    - Deploy `MockUSDC`, `MockReputationRegistry`, and `FreelancerMarketplace` in `setUp()`
    - Expose helper addresses: `client`, `freelancer`, `arbitrator`, `stranger`
    - Add `_fundAndCreate(address client, uint256 amount, string memory description, string[] memory skills)` helper that mints USDC, approves, and calls `createJob`, returning the job ID
    - _Requirements: 1.1_

- [ ] 4. Write property-based and unit tests for `FreelancerMarketplace.sol`
  - [ ] 4.1 Write unit tests for all revert conditions and happy paths in `FreelancerMarketplace.t.sol`
    - Test `createJob` reverts: zero amount, empty description, description too long, too many skills
    - Test `applyForJob` reverts: wrong state, client applying, already applied
    - Test `assignFreelancer` reverts: wrong caller, wrong state, freelancer not applied
    - Test `submitWork` reverts: wrong caller, wrong state, empty deliverable, deliverable too long
    - Test `approveWork` reverts: wrong caller, wrong state
    - Test `raiseDispute` reverts: wrong caller, wrong state
    - Test `resolveDispute` reverts: wrong caller, wrong state
    - Test `getJob`, `getApplicants`, `getApplication` revert on non-existent job ID
    - Test full happy-path flows: create → apply → assign → submit → approve; create → apply → assign → submit → dispute → resolve (both directions)
    - _Requirements: 1.1–1.7, 2.1–2.5, 3.1–3.7, 4.1–4.6, 5.1–5.5, 6.1–6.4, 7.1–7.6, 8.1–8.4_

  - [ ]* 4.2 Write fuzz test for Property 1: Job creation round-trip
    - **Property 1: Job creation stores correct data (round-trip)**
    - Fuzz `client`, `amount`, `description`, `requiredSkills`; use `vm.assume` to exclude zero amount, empty description, description >2048 chars, and >10 skills
    - After `createJob`, call `getJob` and assert all fields match inputs, `state == OPEN`, `freelancer == address(0)`, `deliverable == ""`, `applicationCount == 0`
    - **Validates: Requirements 1.1, 8.1**

  - [ ]* 4.3 Write fuzz test for Property 2: Invalid inputs always revert
    - **Property 2: Invalid job creation inputs always revert**
    - Fuzz with `amount = 0`, `description = ""`, `description.length > 2048`, and `skills.length > 10` separately
    - Assert each case reverts and `jobCount()` does not increase
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [ ]* 4.4 Write fuzz test for Property 3: Job IDs are sequential and unique
    - **Property 3: Job IDs are sequential and unique**
    - Fuzz `n` (bounded 1–20); create N jobs and assert returned IDs are 0..N-1 and `jobCount() == N`
    - **Validates: Requirements 1.2, 8.3**

  - [ ]* 4.5 Write fuzz test for Property 4: Application submission stores correct data
    - **Property 4: Application submission stores correct data**
    - Fuzz `freelancer`, `proposal`; create a job in OPEN state, then call `applyForJob`
    - Assert `getApplication` returns the correct freelancer, proposal, and timestamp
    - Assert `getApplicants` includes the freelancer
    - Assert `job.applicationCount` incremented by 1
    - **Validates: Requirements 2.1, 3.1**

  - [ ]* 4.6 Write fuzz test for Property 5: Application access control and state validation
    - **Property 5: Application access control and state validation**
    - Fuzz `state` (non-OPEN), `caller` (client or already-applied freelancer)
    - Assert `applyForJob` reverts in each invalid case
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ]* 4.7 Write fuzz test for Property 6: Freelancer assignment transitions state correctly
    - **Property 6: Freelancer assignment transitions state correctly**
    - Fuzz `freelancer`; create job, have freelancer apply, then client assigns
    - Assert `job.state == ASSIGNED` and `job.freelancer == freelancer`
    - **Validates: Requirements 3.3**

  - [ ]* 4.8 Write fuzz test for Property 7: Assignment access control
    - **Property 7: Assignment access control**
    - Fuzz `caller` (non-client) and `freelancer` (not applied)
    - Assert `assignFreelancer` reverts in each invalid case
    - **Validates: Requirements 3.4, 3.5, 3.6**

  - [ ]* 4.9 Write fuzz test for Property 8: Work submission stores deliverable and transitions state
    - **Property 8: Work submission stores deliverable and transitions state**
    - Fuzz `deliverable` string (1–2048 bytes); after `submitWork`, assert `job.state == SUBMITTED` and `job.deliverable == deliverable`
    - Also fuzz an oversized deliverable (>2048 bytes) and assert revert
    - **Validates: Requirements 4.1**

  - [ ]* 4.10 Write fuzz test for Property 9: Approval releases full USDC amount to freelancer
    - **Property 9: Approval releases full USDC amount to freelancer**
    - Fuzz `amount`; record freelancer and marketplace USDC balances before `approveWork`; assert freelancer balance increases by exactly `amount` and marketplace balance decreases by exactly `amount`
    - **Validates: Requirements 5.1**

  - [ ]* 4.11 Write fuzz test for Property 10: Access control — only authorized callers succeed
    - **Property 10: Access control — only authorized callers succeed**
    - Fuzz `stranger` address; use `vm.assume` to exclude client, freelancer, and arbitrator
    - Assert `submitWork` by stranger reverts; `approveWork`/`raiseDispute` by stranger reverts; `resolveDispute` by stranger reverts
    - Assert job state is unchanged after each failed call
    - **Validates: Requirements 3.4, 4.2, 5.2, 6.2, 7.3**

  - [ ]* 4.12 Write fuzz test for Property 11: State machine rejects out-of-order transitions
    - **Property 11: State machine rejects out-of-order transitions**
    - For each state S, attempt every function that requires a different state and assert revert
    - E.g., call `approveWork` on an OPEN job; call `submitWork` on a SUBMITTED job; call `assignFreelancer` on an ASSIGNED job; call `resolveDispute` on an OPEN job
    - **Validates: Requirements 2.2, 3.5, 4.3, 5.3, 6.3, 7.4**

  - [ ]* 4.13 Write test for Property 12: ERC-8004 failure never blocks payment
    - **Property 12: ERC-8004 failure never blocks payment**
    - Deploy `FreelancerMarketplace` with `MockReputationRegistry` (always reverts) as the reputation registry
    - Call `approveWork` and assert USDC transfer succeeds and `JobApproved` event is emitted despite the registry revert
    - Repeat for `resolveDispute(jobId, true)`
    - **Validates: Requirements 5.5, 7.6**

  - [ ]* 4.14 Write fuzz test for Property 13: Events contain correct fields for all state transitions
    - **Property 13: Events contain correct fields for all state transitions**
    - Use `vm.expectEmit` before each state-transition call; assert all indexed and non-indexed fields match the job's stored data
    - Cover all seven events: `JobCreated`, `JobApplicationSubmitted`, `FreelancerAssigned`, `WorkSubmitted`, `JobApproved`, `DisputeRaised`, `DisputeResolved`
    - **Validates: Requirements 1.7, 2.5, 3.7, 4.6, 5.4, 6.4, 7.5**

  - [ ]* 4.15 Write fuzz test for Property 14: Dispute locks funds; resolution releases correct amount
    - **Property 14: Dispute locks funds; resolution releases correct amount**
    - Fuzz `amount` and `favorFreelancer` bool; record balances before `resolveDispute`
    - Assert the correct recipient's balance increases by exactly `amount` and marketplace balance decreases by exactly `amount`
    - Assert job transitions to `RESOLVED` in both cases
    - **Validates: Requirements 6.1, 7.1, 7.2**

- [x] 5. Checkpoint — run Foundry test suite
  - Run `forge test -vv` and ensure all tests pass. Run `forge build` to confirm the contract compiles without warnings. Ask the user if any questions arise before proceeding to deployment.

- [x] 6. Write Foundry deployment script and deploy to Arc Testnet
  - Create `script/Deploy.s.sol` as a `forge-std` `Script` that reads `PRIVATE_KEY`, `ARBITRATOR_ADDRESS` from environment variables
  - Pass `USDC_ADDRESS = 0x3600000000000000000000000000000000000000`, `REPUTATION_REGISTRY = 0x8004B663056A597Dffe9eCcC1965A193B7388713`, and the arbitrator address to the `FreelancerMarketplace` constructor
  - Broadcast the deployment transaction using `vm.startBroadcast(privateKey)`
  - Log the deployed contract address with `console.log`
  - Run `forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.arc.network --broadcast` and record the deployed address
  - Save the deployed address to `.env` as `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
  - **Deployed at: 0x07191A01Ab724aA7c59F272946E533ec142d7E0F**
  - _Requirements: 1.1_

- [x] 7. Scaffold Next.js 14 frontend project
  - Run `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"` to create the frontend project
  - Install dependencies: `wagmi@^2`, `viem@^2`, `@rainbow-me/rainbowkit@^2`, `@tanstack/react-query@^5`
  - Create `.env.local` with `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=` and `NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x07191A01Ab724aA7c59F272946E533ec142d7E0F`
  - Create the directory structure: `src/app/`, `src/components/`, `src/lib/hooks/`, `src/constants/`
  - **Branding: ArcHire with dark theme and electric blue (#0052FF) accent**
  - _Requirements: 9.1_

- [x] 8. Configure Arc Testnet chain and wagmi
  - Create `src/lib/wagmi.ts` using `getDefaultConfig` from RainbowKit with `arcTestnet` from `viem/chains` as the only chain
  - Set `ssr: true` and read `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from `process.env`
  - Create `src/constants/index.ts` with `ARC_TESTNET_CHAIN_ID = 5042002`, `USDC_ADDRESS`, `USDC_DECIMALS = 6`, `FREELANCER_MARKETPLACE_ADDRESS = 0x07191A01Ab724aA7c59F272946E533ec142d7E0F` (from env), and `EXPLORER_URL = "https://testnet.arcscan.network"`
  - _Requirements: 9.1, 9.2_

- [x] 9. Set up root layout with providers and contract ABIs
  - Create `src/app/layout.tsx` as a server component that wraps children in `WagmiProvider` and `RainbowKitProvider` using the wagmi config from step 8; wrap with `QueryClientProvider` from `@tanstack/react-query`
  - Create `src/lib/contracts.ts` that exports `MARKETPLACE_ABI` (copy the full ABI from the compiled Foundry artifact at `contracts/out/FreelancerMarketplace.sol/FreelancerMarketplace.json`) and `USDC_ABI` (minimal ERC-20 ABI with `approve`, `allowance`, `balanceOf`, `transfer`, `transferFrom`)
  - Export a typed `MARKETPLACE_CONTRACT` config object: `{ address: FREELANCER_MARKETPLACE_ADDRESS, abi: MARKETPLACE_ABI }`
  - _Requirements: 9.1_

- [x] 10. Implement utility functions and TypeScript types
  - Create `src/lib/utils.ts` with:
    - `formatAddress(address: string): string` — truncates to `0x1234…abcd`
    - `formatUsdc(amount: bigint): string` — divides by `1e6` and formats to 2 decimal places (e.g., `"5.00 USDC"`)
    - `parseUsdc(value: string): bigint` — parses a decimal string to 6-decimal bigint
    - `parseContractError(error: unknown): string` — uses viem's `decodeErrorResult` with `MARKETPLACE_ABI` to decode custom errors; returns `"CANCELLED"` for user-rejected transactions
    - `jobStateToLabel(state: number): JobState` — maps numeric enum to `'OPEN' | 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED'`
  - Export `Job`, `Application`, `JobState`, and `STATE_COLORS` TypeScript types/constants
  - _Requirements: 13.1, 15.3, 15.4_

- [x] 11. Implement wagmi hooks for contract reads
  - Create `src/lib/hooks/useJob.ts` — wraps `useReadContract` for `getJob(jobId)`; returns `{ job, isLoading, error, refetch }`
  - Create `src/lib/hooks/useJobCount.ts` — wraps `useReadContract` for `jobCount()`; returns `{ count, isLoading, refetch }`
  - Create `src/lib/hooks/useApplicants.ts` — wraps `useReadContract` for `getApplicants(jobId)`; returns `{ applicants, isLoading, error, refetch }`
  - Create `src/lib/hooks/useApplication.ts` — wraps `useReadContract` for `getApplication(jobId, freelancer)`; returns `{ application, isLoading, error, refetch }`
  - Create `src/lib/hooks/useUsdcBalance.ts` — wraps `useReadContract` for `USDC.balanceOf(address)`; returns `{ balance, isLoading, refetch }`
  - All hooks should accept an optional `watch` parameter to enable polling every 4 seconds via `refetchInterval`
  - _Requirements: 9.4, 13.1, 14.1, 14.2, 3.1, 3.2_

- [x] 12. Implement wagmi hooks for contract writes
  - Create `src/lib/hooks/useCreateJob.ts`:
    - Accept `{ amount, description, requiredSkills }` params
    - Check `USDC.allowance(account, marketplaceAddress)`; if insufficient, first call `USDC.approve(marketplaceAddress, amount)` and wait for confirmation
    - Then call `marketplace.createJob(amount, description, requiredSkills)` and wait for confirmation
    - Return `{ createJob, status, txHash, error }` where `status` is `'idle' | 'approving' | 'pending' | 'success' | 'error'`
  - Create `src/lib/hooks/useApplyForJob.ts` — wraps `useWriteContract` for `applyForJob(jobId, proposal)`; returns `{ applyForJob, status, txHash, error }`
  - Create `src/lib/hooks/useAssignFreelancer.ts` — wraps `useWriteContract` for `assignFreelancer(jobId, freelancer)`; returns `{ assignFreelancer, status, txHash, error }`
  - Create `src/lib/hooks/useSubmitWork.ts` — wraps `useWriteContract` for `submitWork(jobId, deliverable)`; returns `{ submitWork, status, txHash, error }`
  - Create `src/lib/hooks/useApproveWork.ts` — wraps `useWriteContract` for `approveWork(jobId)`; returns `{ approveWork, status, txHash, error }`
  - Create `src/lib/hooks/useRaiseDispute.ts` — wraps `useWriteContract` for `raiseDispute(jobId)`; returns `{ raiseDispute, status, txHash, error }`
  - Create `src/lib/hooks/useResolveDispute.ts` — wraps `useWriteContract` for `resolveDispute(jobId, favorFreelancer)`; returns `{ resolveDispute, status, txHash, error }`
  - All write hooks should parse errors using `parseContractError` from `utils.ts`
  - _Requirements: 10.2, 11.2, 12.3, 13.2, 13.3, 13.4, 15.1, 15.2, 15.3, 15.4_

- [x] 13. Implement shared UI components
  - [x] 13.1 Create `src/components/ConnectButton.tsx`
    - Render RainbowKit's `<ConnectButton />` component
    - Show the connected wallet's truncated address using `formatAddress`
    - _Requirements: 9.1, 9.3_

  - [x] 13.2 Create `src/components/NetworkGuard.tsx`
    - Use `useChainId()` from wagmi; if the connected chain is not `ARC_TESTNET_CHAIN_ID`, render a banner with a "Switch to Arc Testnet" button that calls `useSwitchChain`
    - If not connected, render nothing (wallet connection handles this)
    - _Requirements: 9.2_

  - [x] 13.3 Create `src/components/UsdcBalance.tsx`
    - Use `useUsdcBalance` hook; display formatted balance using `formatUsdc`
    - Show a skeleton loader while loading
    - _Requirements: 9.4_

  - [x] 13.4 Create `src/components/TxNotification.tsx`
    - Accept `{ status, txHash, error }` props
    - Render a toast-style notification: pending (spinner + explorer link), success (green + tx hash link), error (red + decoded error message), cancelled (neutral dismissal message)
    - Explorer links use `EXPLORER_URL + "/tx/" + txHash`
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 13.5 Create `src/components/JobCard.tsx`
    - Accept a `Job` prop; display job ID, truncated client and freelancer addresses (or "Not assigned yet" if address(0)), formatted USDC amount, a colored state badge using `STATE_COLORS`, a preview of the job description (truncated if necessary), required skills as tags, and application count
    - Wrap in a `<Link href={"/jobs/" + job.id}>` for navigation
    - _Requirements: 14.2, 14.3_

  - [x] 13.6 Create `src/components/ApplicationsList.tsx`
    - Accept `jobId` prop; use `useApplicants` to fetch applicants list
    - For each applicant, use `useApplication` to fetch their proposal
    - Display each applicant with their address, proposal text, and an "Assign" button (only shown if connected wallet is the client)
    - Call `useAssignFreelancer` when "Assign" is clicked
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 13.7 Create `src/components/ApplyForJobForm.tsx`
    - Accept `jobId` prop; show a textarea for proposal input
    - Validate non-empty proposal before submitting
    - Call `useApplyForJob` on submit; show `<TxNotification />` for transaction status
    - Hide form if user has already applied (check via `useApplication`)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 14. Implement the job list page (`/jobs`)
  - Create `src/app/jobs/page.tsx` as a client component
  - Use `useJobCount` to get the total job count; use `useJob` in a loop (or fetch all jobs) to build the list
  - Render a grid of `<JobCard />` components showing job ID, client, freelancer (or "Not assigned yet"), amount, state badge, description preview, skills tags, and application count
  - Show an empty state with a "Create the first job →" link to `/jobs/new` when `jobCount == 0`
  - Include `<ConnectButton />` and `<NetworkGuard />` in the layout
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 15. Implement the create job form page (`/jobs/new`)
  - Create `src/app/jobs/new/page.tsx` as a client component
  - Create `src/components/CreateJobForm.tsx`:
    - Three inputs: "USDC Amount" (number), "Job Description" (textarea, max 2048 chars), "Required Skills" (multi-input or comma-separated, max 10 skills)
    - Inline validation: non-empty fields, valid amount > 0, description ≤ 2048 chars, skills ≤ 10; display errors before submitting
    - On submit, call `useCreateJob`; show `<TxNotification />` for each step (approving, pending, success)
    - On success, navigate to `/jobs/[newJobId]` using `useRouter`
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 16. Implement the job detail page (`/jobs/[id]`)
  - Create `src/app/jobs/[id]/page.tsx` as a client component that reads `params.id`
  - Create `src/components/JobDetail.tsx`:
    - Display all job fields: ID, client, freelancer (or "Not assigned yet" if address(0)), amount, state badge, description, required skills as tags, application count, deliverable (when non-empty)
    - Use `useAccount` to determine the connected wallet's role (client, freelancer, arbitrator, or observer)
    - Refresh job data after each confirmed transaction using the `refetch` from `useJob`
  - Integrate `src/components/ApplyForJobForm.tsx`:
    - Shown when job is in `OPEN` state and connected wallet is not the client
    - Textarea for proposal; validate non-empty
    - On submit, call `useApplyForJob`; show `<TxNotification />`
  - Integrate `src/components/ApplicationsList.tsx`:
    - Shown when `role == 'client'` and `state == 'OPEN'`
    - Display all applicants with proposals and "Assign" buttons
  - Integrate `src/components/SubmitWorkForm.tsx`:
    - Shown when `role == 'freelancer'` and `state == 'ASSIGNED'`
    - Textarea for deliverable (plain text or URL); validate non-empty and max 2048 characters
    - On submit, call `useSubmitWork`; show `<TxNotification />`
  - Integrate `src/components/ActionButtons.tsx`:
    - Shown when `role == 'client'` and `state == 'SUBMITTED'`: render "Approve" and "Raise Dispute" buttons
    - Shown when `role == 'arbitrator'` and `state == 'DISPUTED'`: render "Resolve for Freelancer" and "Resolve for Client" buttons
    - All buttons disabled while any transaction is pending; show loading spinner
    - Each button calls the appropriate write hook and shows `<TxNotification />`
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 17. Implement root page redirect and final layout wiring
  - Create `src/app/page.tsx` that redirects to `/jobs` using `next/navigation` `redirect()`
  - Ensure `<NetworkGuard />` is rendered in the root layout so it appears on all pages
  - Ensure `<ConnectButton />` and `<UsdcBalance />` appear in a shared header component rendered from `layout.tsx`
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 18. Checkpoint — run frontend build and type-check
  - Run `npm run build` (or `next build`) inside the `frontend/` directory and fix any TypeScript or build errors. Ensure all pages compile without errors. Ask the user if any questions arise.

- [ ]* 19. Write frontend unit tests for utility functions and form validation
  - Set up Vitest with `@testing-library/react` and `@testing-library/user-event` in the frontend project
  - Write unit tests for `formatUsdc`, `parseUsdc`, `formatAddress`, `parseContractError`, and `jobStateToLabel` in `utils.ts`
  - Write unit tests for `CreateJobForm` validation: empty fields, invalid amount, zero amount, description >2048 chars, >10 skills all produce inline errors
  - Write unit tests for `ApplyForJobForm` validation: empty proposal produces error
  - Write unit tests for `SubmitWorkForm` validation: empty deliverable and >2048 char deliverable produce errors
  - _Requirements: 10.3_

- [ ]* 20. Write frontend property test for role/state → action visibility
  - Install `fast-check` in the frontend project
  - Write a property test in Vitest using `fc.assert` and `fc.property` that, for any combination of `JobState` and role (`'client'`, `'freelancer'`, `'arbitrator'`, `'observer'`), the `getAvailableActions(state, role)` utility returns exactly the correct set of actions (no extra, no missing)
  - Extract `getAvailableActions` as a pure function from `ActionButtons.tsx` to make it testable
  - **Property 10 (frontend): role/state → correct actions shown**
  - **Validates: Requirements 13.2, 13.3, 13.4, 11.1, 12.1**

- [ ] 21. Final checkpoint — end-to-end wiring verification
  - Verify the deployed contract address in `.env.local` matches the address from step 6 (0x07191A01Ab724aA7c59F272946E533ec142d7E0F)
  - Run `forge test -vv` one final time to confirm all smart contract tests still pass
  - Run `npm run build` in the frontend to confirm a clean production build
  - Manually verify the ABI in `src/lib/contracts.ts` matches the compiled artifact from `contracts/out/FreelancerMarketplace.sol/FreelancerMarketplace.json`
  - Ensure all environment variables are documented in `.env.example` (contract) and `.env.local.example` (frontend)
  - Ask the user if any questions arise before considering the implementation complete.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use Foundry's built-in fuzzer (`forge test --fuzz-runs 256`) — no extra library needed
- Frontend property tests use `fast-check` (install with `npm install --save-dev fast-check`)
- USDC on Arc Testnet uses **6 decimals** for ERC-20 operations (e.g., 5 USDC = `5_000_000`)
- The `arcTestnet` chain is available directly from `viem/chains` — no custom chain definition needed
- The two-step approve → createJob flow in `useCreateJob` is transparent to the user; show distinct status messages for each step
- All contract addresses are in `src/constants/index.ts`; never hardcode them in components
- The `FreelancerMarketplace` contract address is injected via `NEXT_PUBLIC_MARKETPLACE_ADDRESS` env var after deployment
- **Deployed contract:** `0x07191A01Ab724aA7c59F272946E533ec142d7E0F` on Arc Testnet
- **Branding:** ArcHire with dark theme and electric blue (#0052FF) accent
- **State machine:** OPEN → ASSIGNED → SUBMITTED → APPROVED/DISPUTED → RESOLVED
- **Application system:** Freelancers apply with proposals; clients review and assign from applicants
- **Job details:** Each job includes description (max 2048 chars) and required skills (max 10)
