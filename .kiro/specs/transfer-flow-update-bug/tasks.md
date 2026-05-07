# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Transfer State Change Not Detected
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists (React Query cache staleness)
  - **Scoped PBT Approach**: Scope the property to the concrete failing case: job state transitions from 2 (SUBMITTED) to 3 (TRANSFER_REQUESTED) on blockchain, but component continues to show "Waiting for Client Review"
  - Test that when blockchain state changes to 3 (TRANSFER_REQUESTED), the component detects this change within the polling interval and displays transfer instructions
  - Mock `useReadContract` to return job with state 3 (TRANSFER_REQUESTED)
  - Assert that `transferRequested` variable evaluates to true
  - Assert that component renders transfer instructions section (not "Waiting for Client Review")
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists due to cache staleness)
  - Document counterexamples found: component shows "Waiting for Client Review" even when blockchain state is 3, React Query cache contains stale data
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Transfer-Requested State Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (job states 0, 1, 2, 4, 5, 6)
  - Write property-based tests capturing observed behavior patterns:
    - For job state 2 (SUBMITTED): component shows "Waiting for Client Review" message
    - For job state 4 (APPROVED): component updates to show approval status
    - For transferConfirmed === true: component shows "Transfer Confirmed" success message
    - For blockchain query errors: component displays error message in debug info
    - For polling mechanism: refetch occurs every 10 seconds without performance issues
  - Property-based testing generates many test cases for stronger guarantees across all non-TRANSFER_REQUESTED states
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix React Query cache invalidation for transfer state detection

  - [x] 3.1 Update FreelancerTransferConfirmation component with proper cache invalidation
    - Import `useQueryClient` from `@tanstack/react-query` to access React Query cache
    - Add `queryClient.invalidateQueries()` call on component mount to force fresh data fetch
    - Add query key dependency to `useReadContract` to ensure proper cache keying
    - Add `useEffect` to monitor `job.state` changes and log when state transitions occur
    - Enhance debug logging to track query execution, data reception, and component re-renders
    - _Bug_Condition: isBugCondition(input) where input.blockchainState === 3 AND input.jobState !== 3 AND input.componentRendering === 'Waiting for Client Review'_
    - _Expected_Behavior: Component SHALL detect state change to TRANSFER_REQUESTED (3) within 10 seconds and display transfer instructions_
    - _Preservation: Polling mechanism continues every 10 seconds, manual refresh works, other job states render correctly, debug logging continues_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Replace manual refresh logic with React Query cache invalidation
    - Replace `window.location.reload()` in manual refresh button with `queryClient.invalidateQueries()` call
    - Add proper query key targeting to invalidate only the specific job query
    - Ensure refresh triggers immediate refetch without full page reload
    - Add loading state feedback during manual refresh
    - _Bug_Condition: Manual refresh button does not update UI when blockchain state is 3_
    - _Expected_Behavior: Manual refresh SHALL immediately query blockchain and update UI to show transfer instructions_
    - _Preservation: Manual refresh button continues to work for all job states_
    - _Requirements: 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Improve query key management for proper cache invalidation
    - Review `useReadContract` query key structure to ensure it includes jobId
    - Add explicit query key configuration if needed for better cache control
    - Ensure query key changes appropriately when job state changes on blockchain
    - Test that React Query recognizes when to refetch based on query key changes
    - _Bug_Condition: Query key does not change when blockchain state changes, causing cache to serve stale data_
    - _Expected_Behavior: Query key SHALL properly identify when data is stale and trigger refetch_
    - _Preservation: Query key structure continues to work for all job queries_
    - _Requirements: 2.1, 2.4, 3.5_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Transfer State Change Detected
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - component now detects state change and shows transfer instructions)
    - Verify that component correctly renders transfer instructions when blockchain state is 3
    - Verify that `transferRequested` variable evaluates to true when job.state === 3
    - _Requirements: 2.1, 2.4_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Transfer-Requested State Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix:
      - Job state 2 (SUBMITTED) still shows "Waiting for Client Review"
      - Job state 4 (APPROVED) still updates correctly
      - transferConfirmed === true still shows success message
      - Blockchain errors still display in debug info
      - Polling continues every 10 seconds without issues
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all tests (bug condition + preservation) to verify complete fix
  - Verify no regressions in other job states or component behaviors
  - Test manual refresh button works correctly with new cache invalidation
  - Test polling mechanism continues to work every 10 seconds
  - Test full page reload correctly shows transfer instructions when state is 3
  - Ask the user if questions arise or if additional testing is needed
