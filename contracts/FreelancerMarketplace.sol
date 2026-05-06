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
    error InvalidState(uint256 jobId, JobState current, JobState required);
    error JobNotFound(uint256 jobId);
    error AlreadyApplied(uint256 jobId, address freelancer);
    error NoApplications(uint256 jobId);
    error ApplicationNotFound(uint256 jobId, address freelancer);
    error TransferFailed();
    error TooManySkills(uint256 provided, uint256 max);

    // ══════════════════════════════════════════════════════════════════════════════
    // TYPES
    // ══════════════════════════════════════════════════════════════════════════════

    enum JobState {
        OPEN,       // 0 — Job posted, accepting applications
        ASSIGNED,   // 1 — Freelancer selected, work in progress
        SUBMITTED,  // 2 — Freelancer submitted deliverable
        APPROVED,   // 3 — Client approved, funds released to freelancer
        DISPUTED,   // 4 — Client raised dispute, funds locked
        RESOLVED    // 5 — Arbitrator resolved, funds released to winner
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
    }

    struct Application {
        address freelancer;
        string proposal;            // Why they're a good fit
        uint256 timestamp;
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════════════════════

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount,
        string description,
        string[] requiredSkills
    );

    event JobApplicationSubmitted(
        uint256 indexed jobId,
        address indexed freelancer,
        string proposal
    );

    event FreelancerAssigned(
        uint256 indexed jobId,
        address indexed freelancer
    );

    event WorkSubmitted(
        uint256 indexed jobId,
        string deliverable
    );

    event JobApproved(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed jobId,
        address indexed client
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

    uint256 private _jobCount;
    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => mapping(address => Application)) private _applications;
    mapping(uint256 => address[]) private _applicants;

    uint256 public constant MAX_DESCRIPTION_LENGTH = 2048;
    uint256 public constant MAX_DELIVERABLE_LENGTH = 2048;
    uint256 public constant MAX_SKILLS = 10;

    // ══════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════════

    constructor(
        address _arbitrator,
        address _usdc,
        address _reputationRegistry
    ) {
        if (_arbitrator == address(0)) revert ZeroAddress();
        if (_usdc == address(0)) revert ZeroAddress();
        if (_reputationRegistry == address(0)) revert ZeroAddress();

        arbitrator = _arbitrator;
        usdc = IERC20(_usdc);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // WRITE FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new job posting with description and required skills
     * @dev Caller must have approved this contract for `amount` USDC beforehand
     * @param amount USDC amount in 6-decimal units (must be > 0)
     * @param description Job description explaining what needs to be done
     * @param requiredSkills Array of required skills (max 10)
     * @return jobId The ID of the newly created job
     */
    function createJob(
        uint256 amount,
        string calldata description,
        string[] memory requiredSkills
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

        _jobCount++;

        emit JobCreated(jobId, msg.sender, amount, description, requiredSkills);
    }

    /**
     * @notice Apply for an open job
     * @dev Only callable when job is in OPEN state
     * @param jobId The job to apply for
     * @param proposal Why you're a good fit for this job
     */
    function applyForJob(uint256 jobId, string calldata proposal) external {
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
            timestamp: block.timestamp
        });

        _applicants[jobId].push(msg.sender);
        job.applicationCount++;

        emit JobApplicationSubmitted(jobId, msg.sender, proposal);
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
     * @notice Approve submitted work and release USDC to freelancer
     * @dev Only callable by client. Attempts ERC-8004 reputation update
     * @param jobId The job to approve
     */
    function approveWork(uint256 jobId) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.SUBMITTED) {
            revert InvalidState(jobId, job.state, JobState.SUBMITTED);
        }
        if (msg.sender != job.client) {
            revert NotClient(msg.sender, job.client);
        }

        job.state = JobState.APPROVED;

        // Transfer USDC to freelancer
        if (!usdc.transfer(job.freelancer, job.amount)) {
            revert TransferFailed();
        }

        // Attempt ERC-8004 reputation update (silent on failure)
        try reputationRegistry.giveFeedback(
            0, 1, 0, "marketplace", "", "", "", bytes32(0)
        ) {} catch {}

        emit JobApproved(jobId, job.freelancer, job.amount);
    }

    /**
     * @notice Raise a dispute on submitted work
     * @dev Only callable by client
     * @param jobId The job to dispute
     */
    function raiseDispute(uint256 jobId) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.SUBMITTED) {
            revert InvalidState(jobId, job.state, JobState.SUBMITTED);
        }
        if (msg.sender != job.client) {
            revert NotClient(msg.sender, job.client);
        }

        job.state = JobState.DISPUTED;

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
            if (!usdc.transfer(job.freelancer, job.amount)) {
                revert TransferFailed();
            }
            try reputationRegistry.giveFeedback(
                0, 1, 0, "marketplace", "", "", "", bytes32(0)
            ) {} catch {}
        } else {
            recipient = job.client;
            if (!usdc.transfer(job.client, job.amount)) {
                revert TransferFailed();
            }
        }

        emit DisputeResolved(jobId, msg.sender, recipient, job.amount);
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
}
