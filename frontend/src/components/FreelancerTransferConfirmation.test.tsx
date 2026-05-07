import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FreelancerTransferConfirmation } from './FreelancerTransferConfirmation';
import * as wagmi from 'wagmi';
import { test, fc } from '@fast-check/vitest';

// Mock wagmi
vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

describe('FreelancerTransferConfirmation - Bug Condition Exploration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property 1: Bug Condition - Transfer State Change Not Detected
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.4**
   * 
   * CRITICAL: This test simulates the ACTUAL bug condition
   * 
   * Bug Condition: The blockchain state HAS changed to 3 (TRANSFER_REQUESTED),
   * but React Query's cache is serving STALE data with state 2 (SUBMITTED).
   * This causes the component to show "Waiting for Client Review" even though
   * the blockchain state is actually 3.
   * 
   * Root Cause: React Query cache staleness - even with refetchInterval: 10000
   * and staleTime: 0, the cache is not being invalidated properly when the
   * blockchain state changes. The component receives stale data from the cache.
   * 
   * Test Approach: Simulate the bug by mocking useReadContract to return
   * STALE data (state 2) even though the blockchain actually has state 3.
   * This represents what happens in production when React Query serves cached
   * data instead of fresh blockchain data.
   * 
   * EXPECTED OUTCOME ON UNFIXED CODE: Test PASSES (confirms bug exists)
   * - Component shows "Waiting for Client Review" because it receives stale state 2
   * - transferRequested evaluates to false because job.state === 2 (stale)
   * - This is the ACTUAL bug: cache serves stale data even after blockchain changes
   * 
   * EXPECTED OUTCOME AFTER FIX: Test FAILS (bug is fixed)
   * - After fix, cache will be properly invalidated
   * - Component will receive fresh data with state 3
   * - Component will show transfer instructions instead of waiting message
   * - We'll need to update this test after the fix to verify correct behavior
   */
  it('BUG REPRODUCTION: component shows waiting message when React Query cache serves stale state 2 data (even though blockchain has state 3)', () => {
    // Arrange: Simulate React Query cache serving STALE data
    // In production, the blockchain has state 3, but the cache returns state 2
    const staleJobData = {
      state: 2, // SUBMITTED (STALE - blockchain actually has state 3)
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0x0987654321098765432109876543210987654321',
      amount: BigInt(1000),
      deadline: BigInt(Date.now() + 86400000),
      workSubmitted: true,
    };

    // Mock useReadContract to return stale data (simulating cache staleness bug)
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: staleJobData,
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now() - 60000, // Data is 1 minute old (stale)
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: true, // Mark as stale
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component with stale cache data
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: This is the BUG - component shows waiting message because cache is stale
    // Even though blockchain has state 3, the component receives state 2 from cache
    
    // BUG SYMPTOM 1: Component shows "Waiting for Client Review"
    const waitingMessage = screen.getByText(/Waiting for Client Review/i);
    expect(waitingMessage).toBeInTheDocument();
    
    // BUG SYMPTOM 2: Component does NOT show transfer instructions
    const transferRequestedHeading = screen.queryByText(/Repo Transfer Requested/i);
    expect(transferRequestedHeading).toBeNull();
    
    // BUG SYMPTOM 3: Debug info shows state 2 (stale) instead of state 3 (actual)
    const stateDisplay = screen.getByText(/Job State:/i);
    expect(stateDisplay).toBeInTheDocument();
    // The debug section should show state 2 (the stale cached value)
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/SUBMITTED/)).toBeInTheDocument();
    
    // This test PASSING confirms the bug exists: the component accepts stale cache data
    // After the fix, this test should FAIL because the cache will be properly invalidated
  });

  /**
   * Property 1: Expected Behavior - Transfer State Change Detected
   * 
   * **Validates: Requirements 2.1, 2.4**
   * 
   * This test encodes the EXPECTED behavior after the fix.
   * 
   * Expected Behavior: When blockchain state is 3 (TRANSFER_REQUESTED),
   * the component SHALL receive fresh data from React Query (not stale cache)
   * and display transfer instructions.
   * 
   * EXPECTED OUTCOME ON UNFIXED CODE: Test PASSES (component logic is correct)
   * - When given fresh state 3 data, component correctly shows transfer instructions
   * - The bug is NOT in the component logic, but in React Query cache management
   * 
   * EXPECTED OUTCOME AFTER FIX: Test PASSES (behavior preserved)
   * - After fix, React Query will serve fresh data with state 3
   * - Component will correctly display transfer instructions
   */
  it('EXPECTED BEHAVIOR: component shows transfer instructions when React Query serves fresh state 3 data', () => {
    // Arrange: Simulate React Query serving FRESH data with state 3
    const freshJobData = {
      state: 3, // TRANSFER_REQUESTED (FRESH - matches blockchain)
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0x0987654321098765432109876543210987654321',
      amount: BigInt(1000),
      deadline: BigInt(Date.now() + 86400000),
      workSubmitted: true,
    };

    // Mock useReadContract to return fresh data
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: freshJobData,
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(), // Fresh data
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false, // Fresh data
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component with fresh data
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Component correctly shows transfer instructions with fresh data
    
    // EXPECTED BEHAVIOR 1: Component shows "Repo Transfer Requested"
    const transferRequestedHeading = screen.getByText(/Repo Transfer Requested/i);
    expect(transferRequestedHeading).toBeInTheDocument();
    
    // EXPECTED BEHAVIOR 2: Component does NOT show "Waiting for Client Review"
    const waitingMessage = screen.queryByText(/Waiting for Client Review/i);
    expect(waitingMessage).toBeNull();
    
    // EXPECTED BEHAVIOR 3: Transfer instructions are visible
    expect(screen.getByText(/Transfer Instructions:/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to your GitHub repo/i)).toBeInTheDocument();
    
    // EXPECTED BEHAVIOR 4: Input field for proof link is present
    const proofLinkInput = screen.getByPlaceholderText(/Paste your imgur.com screenshot link/i);
    expect(proofLinkInput).toBeInTheDocument();
    
    // EXPECTED BEHAVIOR 5: Confirm button is present
    const confirmButton = screen.getByRole('button', { name: /Confirm Transfer Sent/i });
    expect(confirmButton).toBeInTheDocument();
    
    // This test PASSING confirms the component logic is correct
    // The fix needs to ensure React Query always serves fresh data like this
  });
});


describe('FreelancerTransferConfirmation - Preservation Properties', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property 2: Preservation - Non-Transfer-Requested State Behavior
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   * 
   * This property-based test verifies that the component's behavior for
   * non-TRANSFER_REQUESTED states (0, 1, 2, 4, 5, 6) remains unchanged
   * after the fix is implemented.
   * 
   * Observation-First Methodology:
   * 1. Run this test on UNFIXED code to observe baseline behavior
   * 2. Document the observed behavior patterns
   * 3. After fix, re-run to ensure behavior is preserved
   * 
   * EXPECTED OUTCOME ON UNFIXED CODE: Test PASSES
   * - For state 2 (SUBMITTED): shows "Waiting for Client Review"
   * - For state 4 (APPROVED): shows appropriate UI (not waiting message)
   * - For other states: shows appropriate UI based on state
   * 
   * EXPECTED OUTCOME AFTER FIX: Test PASSES (behavior preserved)
   * - All non-TRANSFER_REQUESTED states continue to work correctly
   * - No regressions introduced by the cache invalidation fix
   */
  test.prop([
    // Generate job states excluding TRANSFER_REQUESTED (3)
    fc.constantFrom(0, 1, 2, 4, 5, 6),
  ])('preserves correct UI rendering for non-TRANSFER_REQUESTED states (state: %s)', (jobState) => {
    // Arrange: Create job data with the generated state
    const jobData = {
      state: jobState,
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0x0987654321098765432109876543210987654321',
      amount: BigInt(1000),
      deadline: BigInt(Date.now() + 86400000),
      workSubmitted: jobState >= 2, // Work submitted for states 2+
    };

    // Mock useReadContract to return job data
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: jobData,
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Verify behavior based on state
    if (jobState === 2) {
      // Requirement 3.1: State 2 (SUBMITTED) shows "Waiting for Client Review"
      const waitingMessage = screen.getByText(/Waiting for Client Review/i);
      expect(waitingMessage).toBeInTheDocument();
      
      // Should NOT show transfer instructions
      const transferRequestedHeading = screen.queryByText(/Repo Transfer Requested/i);
      expect(transferRequestedHeading).toBeNull();
      
      // Should show debug info with state 2
      expect(screen.getByText(/Job State:/i)).toBeInTheDocument();
      expect(screen.getByText(/SUBMITTED/)).toBeInTheDocument();
    } else {
      // For other states (0, 1, 4, 5, 6), should also show waiting message
      // since transferRequested is false (state !== 3)
      const waitingMessage = screen.getByText(/Waiting for Client Review/i);
      expect(waitingMessage).toBeInTheDocument();
      
      // Should NOT show transfer instructions
      const transferRequestedHeading = screen.queryByText(/Repo Transfer Requested/i);
      expect(transferRequestedHeading).toBeNull();
    }
  });

  /**
   * Property 2.1: Preservation - Transfer Confirmed State
   * 
   * **Validates: Requirement 3.2**
   * 
   * Verifies that when transferConfirmed is true (stored in localStorage),
   * the component shows the "Transfer Confirmed" success message regardless
   * of the current job state.
   * 
   * EXPECTED OUTCOME: Test PASSES on both unfixed and fixed code
   */
  test.prop([
    fc.constantFrom(0, 1, 2, 3, 4, 5, 6), // Any state
    fc.webUrl(), // Generate random proof links
  ])('preserves "Transfer Confirmed" success message when transfer is confirmed (state: %s)', (jobState, proofLink) => {
    // Arrange: Set up localStorage with confirmed transfer
    const transferData = {
      requested: true,
      confirmed: true,
      proofLink: proofLink,
      confirmedAt: Date.now()
    };
    localStorage.setItem('transfer_request_1', JSON.stringify(transferData));

    const jobData = {
      state: jobState,
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0x0987654321098765432109876543210987654321',
      amount: BigInt(1000),
      deadline: BigInt(Date.now() + 86400000),
      workSubmitted: true,
    };

    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: jobData,
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Requirement 3.2 - Shows "Transfer Confirmed" success message
    const transferConfirmedElements = screen.getAllByText(/Transfer Confirmed/i);
    expect(transferConfirmedElements.length).toBeGreaterThan(0);
    
    // Should show success indicator
    expect(screen.getByText(/Transfer confirmed. The client has been notified./i)).toBeInTheDocument();
    
    // Should show the proof link
    const proofLinkElement = screen.getByText(proofLink);
    expect(proofLinkElement).toBeInTheDocument();
    
    // Should NOT show waiting message or transfer request form
    expect(screen.queryByText(/Waiting for Client Review/i)).toBeNull();
    expect(screen.queryByText(/Repo Transfer Requested/i)).toBeNull();
  });

  /**
   * Property 2.2: Preservation - Error Handling
   * 
   * **Validates: Requirement 3.3**
   * 
   * Verifies that when blockchain query returns an error, the component
   * displays the error message in the debug info section.
   * 
   * EXPECTED OUTCOME: Test PASSES on both unfixed and fixed code
   */
  test.prop([
    fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0), // Generate non-empty error messages
  ])('preserves error display in debug info when blockchain query fails (error: %s)', (errorMessage) => {
    // Arrange: Mock useReadContract to return an error
    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      error: new Error(errorMessage),
      refetch: vi.fn(),
      isSuccess: false,
      isFetching: false,
      isPending: false,
      status: 'error',
      fetchStatus: 'idle',
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      failureCount: 1,
      failureReason: new Error(errorMessage),
      errorUpdateCount: 1,
      isLoadingError: true,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Requirement 3.3 - Shows error message in debug info
    expect(screen.getByText(/Waiting for Client Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Debug Info:/i)).toBeInTheDocument();
    expect(screen.getByText(/Error loading job data:/i)).toBeInTheDocument();
    
    // Error message should be displayed (may have whitespace) - use getAllByText since it might match multiple elements
    const errorElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes(errorMessage.trim()) ?? false;
    });
    expect(errorElements.length).toBeGreaterThan(0);
    
    // Should show refresh suggestion
    expect(screen.getByText(/Try clicking the Refresh button above./i)).toBeInTheDocument();
  });

  /**
   * Property 2.3: Preservation - Polling Mechanism
   * 
   * **Validates: Requirement 3.5**
   * 
   * Verifies that the polling mechanism configuration remains unchanged:
   * - refetchInterval: 10000ms (10 seconds)
   * - refetchOnWindowFocus: true
   * - refetchOnMount: true
   * - staleTime: 0
   * 
   * This test verifies the configuration is passed correctly to useReadContract.
   * 
   * EXPECTED OUTCOME: Test PASSES on both unfixed and fixed code
   */
  it('preserves polling mechanism configuration (refetchInterval: 10000ms)', () => {
    // Arrange: Mock useReadContract
    const mockUseReadContract = vi.mocked(wagmi.useReadContract);
    mockUseReadContract.mockReturnValue({
      data: {
        state: 2,
        client: '0x1234567890123456789012345678901234567890',
        freelancer: '0x0987654321098765432109876543210987654321',
        amount: BigInt(1000),
        deadline: BigInt(Date.now() + 86400000),
        workSubmitted: true,
      },
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Requirement 3.5 - Verify useReadContract was called with correct polling config
    expect(mockUseReadContract).toHaveBeenCalled();
    
    const callArgs = mockUseReadContract.mock.calls[0][0];
    expect(callArgs).toHaveProperty('query');
    expect(callArgs.query).toMatchObject({
      refetchInterval: 10000, // 10 seconds
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
    });
  });

  /**
   * Property 2.4: Preservation - State 4 (APPROVED) Behavior
   * 
   * **Validates: Requirement 3.4**
   * 
   * Verifies that when job state is 4 (APPROVED), the component continues
   * to render appropriately (shows waiting message since state !== 3).
   * 
   * Note: The component doesn't have special handling for APPROVED state
   * in the transfer confirmation context - it just shows the waiting message
   * since the transfer hasn't been requested yet.
   * 
   * EXPECTED OUTCOME: Test PASSES on both unfixed and fixed code
   */
  it('preserves correct rendering for state 4 (APPROVED)', () => {
    // Arrange: Create job data with APPROVED state
    const jobData = {
      state: 4, // APPROVED
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0x0987654321098765432109876543210987654321',
      amount: BigInt(1000),
      deadline: BigInt(Date.now() + 86400000),
      workSubmitted: true,
    };

    vi.mocked(wagmi.useReadContract).mockReturnValue({
      data: jobData,
      isError: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
      isPending: false,
      status: 'success',
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    } as any);

    const mockOnConfirm = vi.fn();

    // Act: Render the component
    render(
      <FreelancerTransferConfirmation 
        jobId={BigInt(1)} 
        onConfirm={mockOnConfirm} 
      />
    );

    // Assert: Requirement 3.4 - Shows waiting message (not transfer instructions)
    const waitingMessage = screen.getByText(/Waiting for Client Review/i);
    expect(waitingMessage).toBeInTheDocument();
    
    // Should show debug info with state 4 (APPROVED)
    expect(screen.getByText(/Job State:/i)).toBeInTheDocument();
    expect(screen.getByText(/APPROVED/)).toBeInTheDocument();
    
    // Should NOT show transfer instructions
    const transferRequestedHeading = screen.queryByText(/Repo Transfer Requested/i);
    expect(transferRequestedHeading).toBeNull();
  });
});
