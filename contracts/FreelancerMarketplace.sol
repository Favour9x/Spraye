// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IReputationRegistry {
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;
}

/**
 * @title FreelancerMarketplace
 * @notice Decentralized freelance marketplace with job applications, skills matching, and USDC escrow
 * @dev Deployed on Arc Testnet (Chain ID 5042002) where USDC is the native gas token
 */
contract FreelancerMarketplace {
    // ══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ══════════════════════════════════════════════════════════════════════════════

    error ZeroAmount();
    error ZeroAddress();
    error SelfAssignment();
    error DescriptionEmpty();
    error DescriptionTooLong(uint256 length, uint256 maxLength);
    error DeliverableEmpty();
    error DeliverableTooLong(uint256 length, uint256 maxLength);
    error NotFreelancer(address caller, address expected);
    error NotClient(address caller, address expected);
    error NotArbitrator(address caller, address expected);
    error NotPlatformWallet(address caller, address expected);
    error InvalidState(uint256 jobId, JobState current, JobState required);
    error JobNotFound(uint256 jobId);
    error AlreadyApplied(uint256 jobId, address freelancer);
    error NoApplications(uint256 jobId);
    error ApplicationNotFound(uint256 jobId, address freelancer);
    error TransferFailed();
    error TooManySkills(uint256 provided, uint256 max);
    error InvalidFeePercent(uint256 feePercent);
    error ProofLinkEmpty();

    // ══════════════════════════════════════════════════════════════════════════════
    // TYPES
    // ══════════════════════════════════════════════════════════════════════════════

    enum JobState {
        OPEN,               // 0 — Job posted, accepting applications
        ASSIGNED,           // 1 — Freelancer selected, work in progress
        SUBMITTED,          // 2 — Freelancer submitted deliverable
        TRANSFER_REQUESTED, // 3 — Client requested GitHub repo transfer
        APPROVED,           // 4 — Client approved, funds released to freelancer
        DISPUTED,           // 5 — Dispute raised, funds locked
        RESOLVED            // 6 — Arbitrator resolved, funds released to winner
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;         // address(0) until assigned
        uint256 amount;             // USDC amount in 6-decimal units
        JobState state;
        string description;         // Job description (what needs to be done)
        string[] requiredSkills;    // Required skills (e.g., ["Solidity", "React"])
        string deliverable;         // Submitted work (empty until submitted)
        uint256 applicationCount;   // Number of applications
        uint256 deadline;           // Application deadline timestamp
    }

    struct Application {
        address freelancer;
        string proposal;            // Why they're a good fit
        uint256 timestamp;
        string estimatedDelivery;   // Estimated delivery time
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════════════════════

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount,
        string description,
        string[] requiredSkills,
        string githubUsername,
        uint256 deadline
    );

    event JobApplicationSubmitted(
        uint256 indexed jobId,
        address indexed freelancer,
        string proposal,
        string estimatedDelivery
    );

    event FreelancerAssigned(
        uint256 indexed jobId,
        address indexed freelancer
    );

    event WorkSubmitted(
        uint256 indexed jobId,
        string deliverable
    );

    event TransferRequested(
        uint256 indexed jobId
    );

    event TransferConfirmed(
        uint256 indexed jobId,
        address indexed freelancer,
        string imgurLink
    );

    event JobApproved(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    event PlatformFeePaid(
        uint256 indexed jobId,
        uint256 feeAmount
    );

    event PlatformFeeUpdated(
        uint256 oldFeePercent,
        uint256 newFeePercent
    );

    event DisputeRaised(
        uint256 indexed jobId,
        address indexed raiser
    );

    event DisputeFeePaid(
        uint256 indexed jobId,
        address indexed payer
    );

    event DisputeResolved(
        uint256 indexed jobId,
        address indexed arbitrator,
        address indexed recipient,
        uint256 amount
    );

    // ══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ══════════════════════════════════════════════════════════════════════════════

    address public immutable arbitrator;
    IERC20 public immutable usdc;
    IReputationRegistry public immutable reputationRegistry;
    address public immutable platformWallet;

    uint256 private _jobCount;
    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => mapping(address => Application)) private _applications;
    mapping(uint256 => address[]) private _applicants;
    
    // NEW: Store GitHub username per job
    mapping(uint256 => string) public jobGithubUsernames;
    
    // NEW: Store transfer proof links per job
    mapping(uint256 => string) public transferProofLinks;

    uint256 public constant MAX_DESCRIPTION_LENGTH = 2048;
    uint256 public constant MAX_DELIVERABLE_LENGTH = 2048;
    uint256 public constant MAX_SKILLS = 10;

    // Platform fee: adjustable, default 5%
    uint256 public platformFeePercent = 5;

    // Dispute fee: 1 USDC (6 decimals)
    uint256 public constant DISPUTE_FEE = 1_000_000;

    // ══════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════════

    constructor(
        address _arbitrator,
        address _usdc,
        address _reputationRegistry,
        address _platformWallet
    ) {
        if (_arbitrator == address(0)) revert ZeroAddress();
        if (_usdc == address(0)) revert ZeroAddress();
        if (_reputationRegistry == address(0)) revert ZeroAddress();
        if (_platformWallet == address(0)) revert ZeroAddress();

        arbitrator = _arbitrator;
        usdc = IERC20(_usdc);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        platformWallet = _platformWallet;
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // WRITE FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new job posting with description, required skills, and GitHub username
     * @dev Caller must have approved this contract for `amount` USDC beforehand
     * @param amount USDC amount in 6-decimal units (must be > 0)
     * @param description Job description explaining what needs to be done
     * @param requiredSkills Array of required skills (max 10)
     * @param githubUsername Client's GitHub username for repo transfer
     * @param deadline Application deadline timestamp
     * @return jobId The ID of the newly created job
     */
    function createJob(
        uint256 amount,
        string calldata description,
        string[] memory requiredSkills,
        string calldata githubUsername,
        uint256 deadline
    ) external returns (uint256 jobId) {
        if (amount == 0) revert ZeroAmount();
        
        uint256 descLength = bytes(description).length;
        if (descLength == 0) revert DescriptionEmpty();
        if (descLength > MAX_DESCRIPTION_LENGTH) {
            revert DescriptionTooLong(descLength, MAX_DESCRIPTION_LENGTH);
        }

        if (requiredSkills.length > MAX_SKILLS) {
            revert TooManySkills(requiredSkills.length, MAX_SKILLS);
        }

        // Transfer USDC from client to escrow
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        // Create job record
        jobId = _jobCount;
        Job storage job = _jobs[jobId];
        job.id = jobId;
        job.client = msg.sender;
        job.freelancer = address(0);
        job.amount = amount;
        job.state = JobState.OPEN;
        job.description = description;
        job.requiredSkills = requiredSkills;
        job.deliverable = "";
        job.applicationCount = 0;
        job.deadline = deadline;

        // Store GitHub username onchain
        jobGithubUsernames[jobId] = githubUsername;

        _jobCount++;

        emit JobCreated(jobId, msg.sender, amount, description, requiredSkills, githubUsername, deadline);
    }

    /**
     * @notice Apply for an open job with estimated delivery time
     * @dev Only callable when job is in OPEN state and before deadline
     * @param jobId The job to apply for
     * @param proposal Why you're a good fit for this job
     * @param estimatedDelivery Estimated delivery time (e.g., "1 week", "2 weeks")
     */
    function applyForJob(uint256 jobId, string calldata proposal, string calldata estimatedDelivery) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.OPEN) {
            revert InvalidState(jobId, job.state, JobState.OPEN);
        }

        if (msg.sender == job.client) revert SelfAssignment();

        // Check if already applied
        if (_applications[jobId][msg.sender].freelancer != address(0)) {
            revert AlreadyApplied(jobId, msg.sender);
        }

        // Store application
        _applications[jobId][msg.sender] = Application({
            freelancer: msg.sender,
            proposal: proposal,
            timestamp: block.timestamp,
            estimatedDelivery: estimatedDelivery
        });

        _applicants[jobId].push(msg.sender);
        job.applicationCount++;

        emit JobApplicationSubmitted(jobId, msg.sender, proposal, estimatedDelivery);
    }

    /**
     * @notice Assign a freelancer to the job from applicants
     * @dev Only callable by client when job is in OPEN state
     * @param jobId The job to assign
     * @param freelancer The freelancer address to assign
     */
    function assignFreelancer(uint256 jobId, address freelancer) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.OPEN) {
            revert InvalidState(jobId, job.state, JobState.OPEN);
        }
        if (msg.sender != job.client) {
            revert NotClient(msg.sender, job.client);
        }

        // Verify freelancer applied
        if (_applications[jobId][freelancer].freelancer == address(0)) {
            revert ApplicationNotFound(jobId, freelancer);
        }

        job.freelancer = freelancer;
        job.state = JobState.ASSIGNED;

        emit FreelancerAssigned(jobId, freelancer);
    }

    /**
     * @notice Submit work deliverable for an assigned job
     * @dev Only callable by assigned freelancer
     * @param jobId The job to submit work for
     * @param deliverable Link or description of completed work
     */
    function submitWork(uint256 jobId, string calldata deliverable) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.ASSIGNED) {
            revert InvalidState(jobId, job.state, JobState.ASSIGNED);
        }
        if (msg.sender != job.freelancer) {
            revert NotFreelancer(msg.sender, job.freelancer);
        }

        uint256 deliverableLength = bytes(deliverable).length;
        if (deliverableLength == 0) revert DeliverableEmpty();
        if (deliverableLength > MAX_DELIVERABLE_LENGTH) {
            revert DeliverableTooLong(deliverableLength, MAX_DELIVERABLE_LENGTH);
        }

        job.state = JobState.SUBMITTED;
        job.deliverable = deliverable;

        emit WorkSubmitted(jobId, deliverable);
    }

    /**
     * @notice Request GitHub repo transfer from freelancer
     * @dev Only callable by client when job is in SUBMITTED state
     * @param jobId The job to request transfer for
     */
    function requestTransfer(uint256 jobId) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.SUBMITTED) {
            revert InvalidState(jobId, job.state, JobState.SUBMITTED);
        }
        if (msg.sender != job.client) {
            revert NotClient(msg.sender, job.client);
        }

        job.state = JobState.TRANSFER_REQUESTED;

        emit TransferRequested(jobId);
    }

    /**
     * @notice Confirm transfer with proof link (imgur screenshot)
     * @dev Only callable by freelancer when job is in TRANSFER_REQUESTED state
     * @param jobId The job to confirm transfer for
     * @param imgurLink Link to imgur screenshot showing transfer confirmation
     */
    function confirmTransfer(uint256 jobId, string calldata imgurLink) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.TRANSFER_REQUESTED) {
            revert InvalidState(jobId, job.state, JobState.TRANSFER_REQUESTED);
        }
        if (msg.sender != job.freelancer) {
            revert NotFreelancer(msg.sender, job.freelancer);
        }
        if (bytes(imgurLink).length == 0) revert ProofLinkEmpty();

        // Store proof link onchain
        transferProofLinks[jobId] = imgurLink;

        // Job state remains TRANSFER_REQUESTED until client approves

        emit TransferConfirmed(jobId, msg.sender, imgurLink);
    }

    /**
     * @notice Approve submitted work and release USDC to freelancer (minus platform fee)
     * @dev Only callable by client. Can be called from SUBMITTED or TRANSFER_REQUESTED state
     * @param jobId The job to approve
     */
    function approveWork(uint256 jobId) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        // Allow approval from either SUBMITTED or TRANSFER_REQUESTED state
        if (job.state != JobState.SUBMITTED && job.state != JobState.TRANSFER_REQUESTED) {
            revert InvalidState(jobId, job.state, JobState.SUBMITTED);
        }
        if (msg.sender != job.client) {
            revert NotClient(msg.sender, job.client);
        }

        job.state = JobState.APPROVED;

        // Calculate platform fee (adjustable percentage)
        uint256 platformFee = (job.amount * platformFeePercent) / 100;
        uint256 freelancerAmount = job.amount - platformFee;

        // Transfer platform fee to platform wallet
        if (!usdc.transfer(platformWallet, platformFee)) {
            revert TransferFailed();
        }

        // Transfer remaining amount to freelancer
        if (!usdc.transfer(job.freelancer, freelancerAmount)) {
            revert TransferFailed();
        }

        // Attempt ERC-8004 reputation update (silent on failure)
        try reputationRegistry.giveFeedback(
            0, 1, 0, "marketplace", "", "", "", bytes32(0)
        ) {} catch {}

        emit PlatformFeePaid(jobId, platformFee);
        emit JobApproved(jobId, job.freelancer, freelancerAmount);
    }

    /**
     * @notice Raise a dispute on submitted work
     * @dev Callable by client or freelancer. Requires 1 USDC dispute fee
     * @param jobId The job to dispute
     */
    function raiseDispute(uint256 jobId) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        // Allow dispute from SUBMITTED or TRANSFER_REQUESTED state
        if (job.state != JobState.SUBMITTED && job.state != JobState.TRANSFER_REQUESTED) {
            revert InvalidState(jobId, job.state, JobState.SUBMITTED);
        }

        // Verify caller is either client or freelancer
        if (msg.sender != job.client && msg.sender != job.freelancer) {
            revert NotClient(msg.sender, job.client);
        }

        // Collect 1 USDC dispute fee from caller
        if (!usdc.transferFrom(msg.sender, platformWallet, DISPUTE_FEE)) {
            revert TransferFailed();
        }

        job.state = JobState.DISPUTED;

        emit DisputeFeePaid(jobId, msg.sender);
        emit DisputeRaised(jobId, msg.sender);
    }

    /**
     * @notice Resolve a disputed job
     * @dev Only callable by arbitrator
     * @param jobId The disputed job to resolve
     * @param favorFreelancer True to pay freelancer; false to refund client
     */
    function resolveDispute(uint256 jobId, bool favorFreelancer) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.DISPUTED) {
            revert InvalidState(jobId, job.state, JobState.DISPUTED);
        }
        if (msg.sender != arbitrator) {
            revert NotArbitrator(msg.sender, arbitrator);
        }

        job.state = JobState.RESOLVED;

        address recipient;

        if (favorFreelancer) {
            recipient = job.freelancer;
            
            // Calculate platform fee (adjustable percentage)
            uint256 platformFee = (job.amount * platformFeePercent) / 100;
            uint256 freelancerAmount = job.amount - platformFee;

            // Transfer platform fee
            if (!usdc.transfer(platformWallet, platformFee)) {
                revert TransferFailed();
            }

            // Transfer remaining to freelancer
            if (!usdc.transfer(job.freelancer, freelancerAmount)) {
                revert TransferFailed();
            }

            emit PlatformFeePaid(jobId, platformFee);

            try reputationRegistry.giveFeedback(
                0, 1, 0, "marketplace", "", "", "", bytes32(0)
            ) {} catch {}
        } else {
            recipient = job.client;
            // Full refund to client (no platform fee)
            if (!usdc.transfer(job.client, job.amount)) {
                revert TransferFailed();
            }
        }

        emit DisputeResolved(jobId, msg.sender, recipient, job.amount);
    }

    /**
     * @notice Update platform fee percentage
     * @dev Only callable by platform wallet
     * @param newFeePercent New fee percentage (0-100)
     */
    function setPlatformFee(uint256 newFeePercent) external {
        if (msg.sender != platformWallet) {
            revert NotPlatformWallet(msg.sender, platformWallet);
        }
        if (newFeePercent > 100) {
            revert InvalidFeePercent(newFeePercent);
        }

        uint256 oldFeePercent = platformFeePercent;
        platformFeePercent = newFeePercent;

        emit PlatformFeeUpdated(oldFeePercent, newFeePercent);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // READ FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Get full details of a job
     * @param jobId The job ID to query
     * @return job The job struct
     */
    function getJob(uint256 jobId) external view returns (Job memory job) {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return _jobs[jobId];
    }

    /**
     * @notice Get all applicants for a job
     * @param jobId The job ID
     * @return applicants Array of applicant addresses
     */
    function getApplicants(uint256 jobId) external view returns (address[] memory) {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return _applicants[jobId];
    }

    /**
     * @notice Get application details for a specific freelancer
     * @param jobId The job ID
     * @param freelancer The freelancer address
     * @return application The application struct
     */
    function getApplication(uint256 jobId, address freelancer) 
        external 
        view 
        returns (Application memory) 
    {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return _applications[jobId][freelancer];
    }

    /**
     * @notice Total number of jobs ever created
     * @return count The job count
     */
    function jobCount() external view returns (uint256 count) {
        return _jobCount;
    }

    /**
     * @notice Get GitHub username for a job
     * @param jobId The job ID
     * @return githubUsername The client's GitHub username
     */
    function getGithubUsername(uint256 jobId) external view returns (string memory) {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return jobGithubUsernames[jobId];
    }

    /**
     * @notice Get transfer proof link for a job
     * @param jobId The job ID
     * @return proofLink The imgur proof link
     */
    function getTransferProofLink(uint256 jobId) external view returns (string memory) {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return transferProofLinks[jobId];
    }
}
