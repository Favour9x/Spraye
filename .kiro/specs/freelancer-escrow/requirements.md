# Requirements Document

## Introduction

**ArcHire** is a decentralized freelance marketplace deployed on Arc Testnet (Chain ID: 5042002), where USDC is the native gas token. The platform enables Clients to post jobs with descriptions and required skills, Freelancers to apply with proposals, and Clients to select the best candidate from applicants. The smart contract holds USDC in escrow and enforces a state machine (OPEN → ASSIGNED → SUBMITTED → APPROVED / DISPUTED → RESOLVED), integrates with ERC-8004 for onchain reputation updates upon successful completion, and provides dispute resolution through a designated arbitrator. The frontend is a modern Next.js app with a dark theme and electric blue (#0052FF) accent, using viem/wagmi for wallet connectivity.

## Glossary

- **Marketplace_Contract**: The Solidity smart contract (FreelancerMarketplace.sol) deployed on Arc Testnet at `0x07191A01Ab724aA7c59F272946E533ec142d7E0F` that holds USDC, enforces job state transitions, manages applications, and integrates with ERC-8004.
- **Client**: The wallet address that creates a job posting with description and required skills, deposits USDC into escrow, reviews applications, selects a Freelancer, and either approves or disputes the submitted work.
- **Freelancer**: A wallet address that applies for OPEN jobs with a proposal, and if selected by the Client, submits a deliverable and receives USDC upon approval.
- **Arbitrator**: A single wallet address set at contract deployment time by the deployer, with authority to force-resolve any disputed job in favor of either the Client or the Freelancer. The Arbitrator address is fixed for the lifetime of the contract and is not configurable per job.
- **Job**: An on-chain record containing the Client address, Freelancer address (initially address(0) until assigned), USDC amount, job description, required skills array, deliverable reference, application count, and current state.
- **Job_Description**: A plain-text string (max 2048 characters) provided by the Client that explains what work needs to be done.
- **Required_Skills**: An array of skill strings (max 10 skills) specified by the Client that indicate the expertise needed for the job (e.g., ["Solidity", "React", "TypeScript"]).
- **Application**: An on-chain record submitted by a Freelancer for an OPEN job, containing the Freelancer's address, a proposal string explaining why they're a good fit, and a timestamp.
- **Proposal**: A plain-text string submitted by a Freelancer as part of their application, explaining their qualifications and why they should be selected.
- **Deliverable**: A plain-text string or a URL (max 2048 characters) submitted by the assigned Freelancer as proof of work completion.
- **ERC-8004**: The Arc Testnet standard for onchain agent identity and reputation. The Marketplace_Contract calls the deployed ERC-8004 contract to increment a Freelancer's reputation score upon job approval.
- **USDC**: The USD-pegged stablecoin used as both the payment currency and the native gas token on Arc Testnet. The ERC-20 interface uses 6 decimal places. Contract address: `0x3600000000000000000000000000000000000000`.
- **Job_State**: The current phase of a Job. Valid states are: `OPEN`, `ASSIGNED`, `SUBMITTED`, `APPROVED`, `DISPUTED`, `RESOLVED`.
- **Frontend**: The Next.js web application branded as "ArcHire" that connects to Arc Testnet via viem/wagmi and provides the user interface for Clients, Freelancers, and Arbitrators. Features a dark theme with electric blue (#0052FF) accent.
- **Arc_Testnet**: The EVM-compatible L1 blockchain with Chain ID 5042002 and RPC endpoint https://rpc.testnet.arc.network.

---

## Requirements

### Requirement 1: Job Posting with Description and Skills

**User Story:** As a Client, I want to post a job with a description and required skills, so that qualified Freelancers can understand what work needs to be done and apply if they have the right expertise.

#### Acceptance Criteria

1. WHEN a Client submits a job creation transaction with a positive USDC amount, a non-empty job description, and a skills array, THE Marketplace_Contract SHALL create a new Job record with Job_State set to `OPEN`, Freelancer address set to address(0), and hold the specified USDC amount in custody.
2. THE Marketplace_Contract SHALL assign each Job a unique numeric identifier incremented from zero.
3. IF a Client submits a job creation transaction with a zero USDC amount, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. IF a Client submits a job creation transaction with an empty job description, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
5. IF a Client submits a job creation transaction with a job description exceeding 2048 characters, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
6. IF a Client submits a job creation transaction with more than 10 required skills, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
7. WHEN a Job is created, THE Marketplace_Contract SHALL emit a `JobCreated` event containing the job ID, Client address, USDC amount, job description, and required skills array.

---

### Requirement 2: Freelancer Application Submission

**User Story:** As a Freelancer, I want to apply for open jobs with a proposal, so that Clients can review my qualifications and consider me for the work.

#### Acceptance Criteria

1. WHEN a Freelancer submits an application for a Job in `OPEN` state with a non-empty proposal, THE Marketplace_Contract SHALL store the Application record containing the Freelancer address, proposal text, and timestamp, and increment the Job's application count.
2. IF a Freelancer attempts to apply for a Job not in `OPEN` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
3. IF the Client wallet address attempts to apply for their own Job, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. IF a Freelancer attempts to apply for a Job they have already applied to, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
5. WHEN an application is submitted, THE Marketplace_Contract SHALL emit a `JobApplicationSubmitted` event containing the job ID, Freelancer address, and proposal text.

---

### Requirement 3: Client Reviews Applications and Assigns Freelancer

**User Story:** As a Client, I want to review all applications for my job and select the best candidate, so that I can assign the work to a qualified Freelancer.

#### Acceptance Criteria

1. THE Marketplace_Contract SHALL expose a read function that accepts a job ID and returns an array of all applicant addresses for that Job.
2. THE Marketplace_Contract SHALL expose a read function that accepts a job ID and a Freelancer address and returns the Application details (freelancer address, proposal, timestamp).
3. WHEN the Client assigns a Freelancer from the applicants list for a Job in `OPEN` state, THE Marketplace_Contract SHALL update the Job's Freelancer address to the selected address and transition the Job_State to `ASSIGNED`.
4. IF a wallet address other than the Client attempts to assign a Freelancer, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
5. IF the Client attempts to assign a Freelancer for a Job not in `OPEN` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
6. IF the Client attempts to assign a Freelancer address that has not applied for the Job, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
7. WHEN a Freelancer is assigned, THE Marketplace_Contract SHALL emit a `FreelancerAssigned` event containing the job ID and the assigned Freelancer address.

---

### Requirement 4: Work Submission

**User Story:** As an assigned Freelancer, I want to submit my deliverable onchain, so that the Client can review and approve payment release.

#### Acceptance Criteria

1. WHEN the assigned Freelancer submits a deliverable reference for a Job in `ASSIGNED` state, THE Marketplace_Contract SHALL update the Job_State to `SUBMITTED` and store the deliverable reference onchain.
2. IF a wallet address other than the assigned Freelancer attempts to submit a deliverable, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
3. IF the Freelancer attempts to submit a deliverable for a Job not in `ASSIGNED` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. IF the Freelancer submits an empty deliverable reference, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
5. IF the Freelancer submits a deliverable reference exceeding 2048 characters, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
6. WHEN a deliverable is submitted, THE Marketplace_Contract SHALL emit a `WorkSubmitted` event containing the job ID and the deliverable reference.

---

### Requirement 5: Client Approval and Payment Release

**User Story:** As a Client, I want to approve submitted work, so that the Freelancer receives their USDC payment automatically and their reputation is updated onchain.

#### Acceptance Criteria

1. WHEN the Client approves a Job in `SUBMITTED` state, THE Marketplace_Contract SHALL update the Job_State to `APPROVED`, transfer the full escrowed USDC amount to the Freelancer address, and attempt to call the ERC-8004 contract to increment the Freelancer's reputation score by one.
2. IF a wallet address other than the Client attempts to approve a Job, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
3. IF the Client attempts to approve a Job not in `SUBMITTED` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. WHEN a Job is approved, THE Marketplace_Contract SHALL emit a `JobApproved` event containing the job ID, Freelancer address, and USDC amount transferred.
5. IF the ERC-8004 reputation call fails, THEN THE Marketplace_Contract SHALL complete the USDC transfer and emit the `JobApproved` event without reverting the transaction.

---

### Requirement 6: Dispute Initiation

**User Story:** As a Client, I want to raise a dispute on submitted work, so that an impartial arbitrator can resolve the disagreement without either party losing funds unfairly.

#### Acceptance Criteria

1. WHEN the Client raises a dispute on a Job in `SUBMITTED` state, THE Marketplace_Contract SHALL update the Job_State to `DISPUTED` and lock the escrowed USDC until the Arbitrator resolves the dispute.
2. IF a wallet address other than the Client attempts to raise a dispute, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
3. IF the Client attempts to raise a dispute on a Job not in `SUBMITTED` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. WHEN a dispute is raised, THE Marketplace_Contract SHALL emit a `DisputeRaised` event containing the job ID and the Client address.

---

### Requirement 7: Arbitrator Resolution

**User Story:** As an Arbitrator, I want to force-resolve a disputed job in favor of either the Client or the Freelancer, so that funds are released fairly and the dispute is closed.

#### Acceptance Criteria

1. WHEN the Arbitrator resolves a Job in `DISPUTED` state in favor of the Freelancer, THE Marketplace_Contract SHALL update the Job_State to `RESOLVED`, transfer the full escrowed USDC to the Freelancer address, and attempt to call the ERC-8004 contract to increment the Freelancer's reputation score by one.
2. WHEN the Arbitrator resolves a Job in `DISPUTED` state in favor of the Client, THE Marketplace_Contract SHALL update the Job_State to `RESOLVED` and refund the full escrowed USDC to the Client address.
3. IF a wallet address other than the contract-level Arbitrator attempts to resolve a disputed Job, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
4. IF the Arbitrator attempts to resolve a Job not in `DISPUTED` state, THEN THE Marketplace_Contract SHALL revert the transaction with a descriptive error.
5. WHEN a Job is resolved, THE Marketplace_Contract SHALL emit a `DisputeResolved` event containing the job ID, the Arbitrator address, the resolution recipient address, and the USDC amount transferred.
6. IF the ERC-8004 reputation call fails during an Arbitrator resolution in favor of the Freelancer, THEN THE Marketplace_Contract SHALL complete the USDC transfer and emit the `DisputeResolved` event without reverting the transaction.

---

### Requirement 8: Job State Visibility

**User Story:** As a Client, Freelancer, or visitor, I want to query the current state and details of any job, so that I can track progress and verify onchain data.

#### Acceptance Criteria

1. THE Marketplace_Contract SHALL expose a read function that accepts a job ID and returns the Client address, Freelancer address, USDC amount, current Job_State, job description, required skills array, deliverable reference, and application count.
2. IF a caller queries a job ID that does not exist, THEN THE Marketplace_Contract SHALL revert with a descriptive error.
3. THE Marketplace_Contract SHALL expose a read function that returns the total number of jobs created.
4. THE Marketplace_Contract SHALL expose a read function that returns the contract-level Arbitrator address.

---

### Requirement 9: Frontend Wallet Connection

**User Story:** As a user, I want to connect my EVM wallet to ArcHire on Arc Testnet, so that I can interact with the marketplace contract from the browser.

#### Acceptance Criteria

1. THE Frontend SHALL prompt the user to connect a wallet using wagmi and display the connected wallet address once connected.
2. WHEN the user's wallet is connected to a network other than Arc Testnet (Chain ID 5042002), THE Frontend SHALL display a prompt to switch to Arc Testnet and provide a one-click network switch action.
3. IF the wallet connection fails, THEN THE Frontend SHALL display a human-readable error message and allow the user to retry.
4. THE Frontend SHALL display the connected wallet's USDC balance on Arc Testnet.

---

### Requirement 10: Client Job Posting UI

**User Story:** As a Client, I want a form to post a new job with description and required skills, so that I can attract qualified Freelancers without writing contract calls manually.

#### Acceptance Criteria

1. THE Frontend SHALL provide a job creation form with input fields for USDC amount, job description (textarea), and required skills (multi-input or comma-separated).
2. WHEN the Client submits the job creation form with valid inputs, THE Frontend SHALL call the Marketplace_Contract's createJob function, display a pending transaction state, and show a success confirmation with the new job ID once the transaction is confirmed.
3. IF the Client submits the job creation form with invalid inputs (empty fields, zero amount, description exceeding 2048 characters, or more than 10 skills), THEN THE Frontend SHALL display inline validation errors before submitting the transaction.
4. WHEN the job creation transaction is confirmed, THE Frontend SHALL navigate the user to the job detail view for the newly created job.

---

### Requirement 11: Freelancer Application UI

**User Story:** As a Freelancer, I want to apply for open jobs with a proposal, so that Clients can see my qualifications and consider me for the work.

#### Acceptance Criteria

1. WHILE a Job is in `OPEN` state and the connected wallet is not the Client, THE Frontend SHALL display an "Apply for Job" form with a textarea for the proposal.
2. WHEN the Freelancer submits the application form with a non-empty proposal, THE Frontend SHALL call the Marketplace_Contract's applyForJob function, display a pending transaction state, and show a success confirmation once the transaction is confirmed.
3. IF the Freelancer has already applied for the Job, THE Frontend SHALL display a message indicating the application was already submitted and hide the application form.
4. WHEN the application transaction is confirmed, THE Frontend SHALL refresh the job state and display the updated application count.

---

### Requirement 12: Client Application Review and Freelancer Assignment UI

**User Story:** As a Client, I want to review all applications for my job and select the best candidate, so that I can assign the work to a qualified Freelancer.

#### Acceptance Criteria

1. WHILE the connected wallet is the Client and the Job_State is `OPEN`, THE Frontend SHALL display a list of all applicants with their wallet addresses and a "View Proposal" action for each.
2. WHEN the Client clicks "View Proposal" for an applicant, THE Frontend SHALL display the applicant's full proposal text.
3. WHILE viewing an applicant's proposal, THE Frontend SHALL display an "Assign" button that calls the Marketplace_Contract's assignFreelancer function.
4. WHEN the Client assigns a Freelancer, THE Frontend SHALL display a pending transaction state, and upon confirmation, refresh the job state to show the Job_State as `ASSIGNED` and the selected Freelancer address.
5. IF no applications have been submitted for the Job, THE Frontend SHALL display a message indicating no applications are available yet.

---

### Requirement 13: Job Detail View and Role-Based Actions

**User Story:** As a Client, Freelancer, or Arbitrator, I want a job detail page that shows the current state and surfaces the correct action buttons for my role, so that I always know what to do next.

#### Acceptance Criteria

1. THE Frontend SHALL display a job detail view showing the job ID, Client address, Freelancer address (or "Not assigned yet" if address(0)), USDC amount, current Job_State as a colored badge, job description, required skills as tags, application count, and deliverable reference (when submitted).
2. WHILE the connected wallet is the assigned Freelancer and the Job_State is `ASSIGNED`, THE Frontend SHALL display a "Submit Work" action that accepts a plain-text or URL deliverable reference and calls the Marketplace_Contract's submitWork function.
3. WHILE the connected wallet is the Client and the Job_State is `SUBMITTED`, THE Frontend SHALL display an "Approve" button and a "Raise Dispute" button.
4. WHILE the connected wallet is the Arbitrator and the Job_State is `DISPUTED`, THE Frontend SHALL display a "Resolve for Freelancer" button and a "Resolve for Client" button.
5. WHEN a transaction is pending, THE Frontend SHALL disable all action buttons and display a loading indicator.
6. WHEN a transaction is confirmed, THE Frontend SHALL refresh the job state from the contract and update the UI without requiring a full page reload.

---

### Requirement 14: Job List and Navigation

**User Story:** As a user, I want to browse all jobs on the platform with their descriptions and required skills, so that I can find opportunities that match my expertise or track jobs I'm involved in.

#### Acceptance Criteria

1. THE Frontend SHALL display a public job list view showing all jobs ever created, accessible to any visitor regardless of wallet connection status.
2. THE Frontend SHALL display each job in the list with its job ID, Client address, Freelancer address (or "Not assigned yet"), USDC amount, current Job_State as a colored status badge, a preview of the job description (truncated if necessary), required skills as tags, and application count.
3. WHEN the user selects a job from the list, THE Frontend SHALL navigate to the job detail view for that job.
4. WHILE no jobs have been created, THE Frontend SHALL display an empty state with a prompt to create the first job.

---

### Requirement 15: Transaction Feedback and Error Handling

**User Story:** As a user, I want clear feedback on every transaction I submit, so that I always know whether my action succeeded or failed and why.

#### Acceptance Criteria

1. WHEN a transaction is submitted to Arc Testnet, THE Frontend SHALL display a pending notification with a link to the transaction on the Arc Testnet block explorer.
2. WHEN a transaction is confirmed, THE Frontend SHALL display a success notification with the transaction hash.
3. IF a transaction is reverted by the Marketplace_Contract, THEN THE Frontend SHALL display the revert reason in a human-readable error notification.
4. IF the user rejects a transaction in their wallet, THEN THE Frontend SHALL dismiss the pending state and display a cancellation message without treating it as an error.
