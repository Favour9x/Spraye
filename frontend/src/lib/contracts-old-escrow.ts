import { FREELANCER_ESCROW_ADDRESS, USDC_ADDRESS } from '@/constants';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('📝 Contract Addresses Loaded:');
  console.log('  FREELANCER_ESCROW_ADDRESS:', FREELANCER_ESCROW_ADDRESS);
  console.log('  USDC_ADDRESS:', USDC_ADDRESS);
}

// CORRECT ABI for the DEPLOYED FreelancerEscrow contract (OLD VERSION)
// This matches what's actually deployed at 0x07191A01Ab724aA7c59F272946E533ec142d7E0F
export const ESCROW_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_arbitrator", "type": "address" },
      { "internalType": "address", "name": "_usdc", "type": "address" },
      { "internalType": "address", "name": "_reputationRegistry", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DeliverableEmpty",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "length", "type": "uint256" },
      { "internalType": "uint256", "name": "maxLength", "type": "uint256" }
    ],
    "name": "DeliverableTooLong",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "internalType": "enum FreelancerEscrow.JobState", "name": "current", "type": "uint8" },
      { "internalType": "enum FreelancerEscrow.JobState", "name": "required", "type": "uint8" }
    ],
    "name": "InvalidState",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "jobId", "type": "uint256" }
    ],
    "name": "JobNotFound",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "caller", "type": "address" },
      { "internalType": "address", "name": "expected", "type": "address" }
    ],
    "name": "NotArbitrator",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "caller", "type": "address" },
      { "internalType": "address", "name": "expected", "type": "address" }
    ],
    "name": "NotClient",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "caller", "type": "address" },
      { "internalType": "address", "name": "expected", "type": "address" }
    ],
    "name": "NotFreelancer",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SelfAssignment",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroAmount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" }
    ],
    "name": "DisputeRaised",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "arbitrator", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "DisputeResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "deliverable", "type": "string" }
    ],
    "name": "WorkSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_DELIVERABLE_LENGTH",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "approveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "arbitrator",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "freelancer", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "createJob",
    "outputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "getJob",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "client", "type": "address" },
          { "internalType": "address", "name": "freelancer", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "enum FreelancerEscrow.JobState", "name": "state", "type": "uint8" },
          { "internalType": "string", "name": "deliverable", "type": "string" }
        ],
        "internalType": "struct FreelancerEscrow.Job",
        "name": "job",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jobCount",
    "outputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reputationRegistry",
    "outputs": [{ "internalType": "contract IReputationRegistry", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "internalType": "bool", "name": "favorFreelancer", "type": "bool" }
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "internalType": "string", "name": "deliverable", "type": "string" }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdc",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Minimal ERC-20 ABI for USDC interactions
export const USDC_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Typed contract config for wagmi hooks
export const ESCROW_CONTRACT = {
  address: FREELANCER_ESCROW_ADDRESS,
  abi: ESCROW_ABI,
} as const;

export const USDC_CONTRACT = {
  address: USDC_ADDRESS,
  abi: USDC_ABI,
} as const;
