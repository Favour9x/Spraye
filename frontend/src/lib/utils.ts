import { decodeErrorResult } from 'viem';
import { ESCROW_ABI } from './contracts';
import { USDC_DECIMALS } from '@/constants';

// ══════════════════════════════════════════════════════════════════════════════
// ADDRESS FORMATTING
// ══════════════════════════════════════════════════════════════════════════════

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// USDC FORMATTING (6 decimals)
// ══════════════════════════════════════════════════════════════════════════════

export function formatUsdc(amount: bigint): string {
  const divisor = BigInt(10 ** USDC_DECIMALS);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const decimal = remainder.toString().padStart(USDC_DECIMALS, '0').slice(0, 2);
  return `${whole}.${decimal} USDC`;
}

export function parseUsdc(value: string): bigint {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole = '0', decimal = '0'] = cleaned.split('.');
  
  // Pad or truncate decimal to 6 places
  const paddedDecimal = decimal.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  
  return BigInt(whole) * BigInt(10 ** USDC_DECIMALS) + BigInt(paddedDecimal);
}

// ══════════════════════════════════════════════════════════════════════════════
// JOB STATE
// ══════════════════════════════════════════════════════════════════════════════

export type JobState = 'OPEN' | 'ASSIGNED' | 'SUBMITTED' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'DISPUTED' | 'RESOLVED';

export function jobStateToLabel(state: number): JobState {
  const states: JobState[] = ['OPEN', 'ASSIGNED', 'SUBMITTED', 'TRANSFER_REQUESTED', 'APPROVED', 'DISPUTED', 'RESOLVED'];
  return states[state] || 'OPEN';
}

export const STATE_COLORS: Record<JobState, string> = {
  OPEN: 'bg-purple-900/30 text-purple-300 border-purple-700',
  ASSIGNED: 'bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]',
  SUBMITTED: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
  TRANSFER_REQUESTED: 'bg-blue-900/30 text-blue-300 border-blue-700',
  APPROVED: 'bg-green-900/30 text-green-300 border-green-700',
  DISPUTED: 'bg-red-900/30 text-red-300 border-red-700',
  RESOLVED: 'bg-gray-800 text-gray-300 border-gray-600',
};

// ══════════════════════════════════════════════════════════════════════════════
// JOB TYPE
// ══════════════════════════════════════════════════════════════════════════════

export interface Job {
  id: bigint;
  client: `0x${string}`;
  freelancer: `0x${string}`;
  amount: bigint;
  state: number;
  description: string;
  requiredSkills: string[];
  deliverable: string;
  applicationCount: bigint;
}

export interface Application {
  freelancer: `0x${string}`;
  proposal: string;
  timestamp: bigint;
}

// ══════════════════════════════════════════════════════════════════════════════
// ERROR PARSING
// ══════════════════════════════════════════════════════════════════════════════

export function parseContractError(error: unknown): string {
  if (error instanceof Error) {
    // User rejected transaction
    if (
      error.message.includes('User rejected') ||
      error.message.includes('user rejected') ||
      error.message.includes('User denied')
    ) {
      return 'CANCELLED';
    }

    // Try to decode custom error
    try {
      const match = error.message.match(/0x[0-9a-fA-F]+/);
      if (match) {
        const decoded = decodeErrorResult({
          abi: ESCROW_ABI,
          data: match[0] as `0x${string}`,
        });

        // Format error name and args
        return formatErrorName(decoded.errorName, decoded.args);
      }
    } catch {
      // Decoding failed, fall through to raw message
    }

    return error.message;
  }

  return 'An unknown error occurred';
}

function formatErrorName(errorName: string, args?: readonly unknown[]): string {
  // Convert PascalCase to readable format
  const readable = errorName.replace(/([A-Z])/g, ' $1').trim();

  // Add args if present
  if (args && args.length > 0) {
    const formattedArgs = args.map((arg) => {
      if (typeof arg === 'bigint') return arg.toString();
      if (typeof arg === 'string') return arg;
      return String(arg);
    }).join(', ');
    return `${readable}: ${formattedArgs}`;
  }

  return readable;
}

// ══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  const parsed = parseFloat(amount);
  return !isNaN(parsed) && parsed > 0;
}
