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
 * @title FreelancerEscrow
 * @notice Trustless escrow for freelance work with USDC custody and ERC-8004 reputation integration
 * @dev Deployed on Arc Testnet (Chain ID 5042002) where USDC is the native gas token
 */
contract FreelancerEscrow {
    // ══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ══════════════════════════════════════════════════════════════════════════════

    error ZeroAmount();
    error ZeroAddress();
    error SelfAssignment();
    error DeliverableEmpty();
    error DeliverableTooLong(uint256 length, uint256 maxLength);
    error NotFreelancer(address caller, address expected);
    error NotClient(address caller, address expected);
    error NotArbitrator(address caller, address expected);
    error InvalidState(uint256 jobId, JobState current, JobState required);
    error JobNotFound(uint256 jobId);
    error TransferFailed();

    // ══════════════════════════════════════════════════════════════════════════════
    // TYPES
    // ══════════════════════════════════════════════════════════════════════════════

    enum JobState {
        FUNDED,     // 0 — Job created, funds held in escrow
        SUBMITTED,  // 1 — Freelancer submitted deliverable
        APPROVED,   // 2 — Client approved, funds released to freelancer
        DISPUTED,   // 3 — Client raised dispute, funds locked
        RESOLVED    // 4 — Arbitrator resolved, funds released to winner
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;       // USDC amount in 6-decimal units
        JobState state;
        string deliverable;   // plain text or URL, max 2048 chars
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════════════════════

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed freelancer,
        uint256 amount
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

    uint256 public constant MAX_DELIVERABLE_LENGTH = 2048;

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
     * @notice Create a new job and deposit USDC into escrow
     * @dev Caller must have approved this contract for `amount` USDC beforehand
     * @param freelancer The address that will perform the work
     * @param amount USDC amount in 6-decimal units (must be > 0)
     * @return jobId The ID of the newly created job
     */
    function createJob(address freelancer, uint256 amount) external returns (uint256 jobId) {
        if (amount == 0) revert ZeroAmount();
        if (freelancer == address(0)) revert ZeroAddress();
        if (freelancer == msg.sender) revert SelfAssignment();

        // Transfer USDC from client to escrow
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        // Create job record
        jobId = _jobCount;
        _jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            state: JobState.FUNDED,
            deliverable: ""
        });

        _jobCount++;

        emit JobCreated(jobId, msg.sender, freelancer, amount);
    }

    /**
     * @notice Submit a deliverable for a FUNDED job
     * @dev Only callable by the assigned freelancer
     * @param jobId The job to submit work for
     * @param deliverable Plain-text or URL string (non-empty, max 2048 chars)
     */
    function submitWork(uint256 jobId, string calldata deliverable) external {
        if (jobId >= _jobCount) revert JobNotFound(jobId);

        Job storage job = _jobs[jobId];

        if (job.state != JobState.FUNDED) {
            revert InvalidState(jobId, job.state, JobState.FUNDED);
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
     * @notice Approve submitted work and release USDC to the freelancer
     * @dev Only callable by the client. Attempts ERC-8004 reputation update (silent on failure)
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
            0,          // agentId — will revert if not registered; caught silently
            1,          // value: +1 reputation point
            0,          // valueDecimals
            "escrow",   // tag1
            "",         // tag2
            "",         // endpoint
            "",         // feedbackURI
            bytes32(0)  // feedbackHash
        ) {} catch {}

        emit JobApproved(jobId, job.freelancer, job.amount);
    }

    /**
     * @notice Raise a dispute on submitted work
     * @dev Only callable by the client. Locks funds until arbitrator resolves
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
     * @dev Only callable by the arbitrator
     * @param jobId The disputed job to resolve
     * @param favorFreelancer True to pay the freelancer; false to refund the client
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

            // Transfer USDC to freelancer
            if (!usdc.transfer(job.freelancer, job.amount)) {
                revert TransferFailed();
            }

            // Attempt ERC-8004 reputation update (silent on failure)
            try reputationRegistry.giveFeedback(
                0,          // agentId
                1,          // value: +1 reputation point
                0,          // valueDecimals
                "escrow",   // tag1
                "",         // tag2
                "",         // endpoint
                "",         // feedbackURI
                bytes32(0)  // feedbackHash
            ) {} catch {}
        } else {
            recipient = job.client;

            // Refund USDC to client
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
     * @param jobId The job ID to query (reverts if it does not exist)
     * @return job The job struct
     */
    function getJob(uint256 jobId) external view returns (Job memory job) {
        if (jobId >= _jobCount) revert JobNotFound(jobId);
        return _jobs[jobId];
    }

    /**
     * @notice Total number of jobs ever created
     * @return count The job count
     */
    function jobCount() external view returns (uint256 count) {
        return _jobCount;
    }
}
