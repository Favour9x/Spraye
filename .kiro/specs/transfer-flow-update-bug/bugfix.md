# Bugfix Requirements Document

## Introduction

This document defines the requirements for fixing a critical bug in the freelancer transfer flow where the freelancer's page fails to update after the client requests a GitHub repo transfer. The bug prevents freelancers from seeing transfer instructions even though the blockchain state has changed correctly, blocking the completion of the job workflow.

**Impact:** Freelancers cannot see transfer instructions, preventing them from completing the repo transfer and receiving payment. This breaks the entire job completion flow.

**Affected Component:** `FreelancerTransferConfirmation.tsx` component on the freelancer job detail page.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the client clicks "Request Repo Transfer" and the blockchain transaction confirms successfully (job state changes to 3 - TRANSFER_REQUESTED) THEN the freelancer's page continues to display "Waiting for Client Review" instead of showing transfer instructions

1.2 WHEN the freelancer waits for the 10-second polling interval to trigger a refetch THEN the page still does not update to show transfer instructions

1.3 WHEN the freelancer clicks the manual "Refresh" button on the page THEN the page still does not update to show transfer instructions

1.4 WHEN the freelancer performs a full browser page reload (F5 or Ctrl+R) THEN the page still does not update to show transfer instructions

### Expected Behavior (Correct)

2.1 WHEN the client clicks "Request Repo Transfer" and the blockchain transaction confirms successfully (job state changes to 3 - TRANSFER_REQUESTED) THEN the freelancer's page SHALL automatically detect the state change within 10 seconds and display the transfer instructions with the GitHub username and transfer steps

2.2 WHEN the freelancer clicks the manual "Refresh" button THEN the page SHALL immediately query the blockchain, detect the state change to TRANSFER_REQUESTED, and display the transfer instructions

2.3 WHEN the freelancer performs a full browser page reload THEN the page SHALL query the blockchain on mount, detect the state is TRANSFER_REQUESTED, and display the transfer instructions

2.4 WHEN the job state is 3 (TRANSFER_REQUESTED) on the blockchain THEN the `transferRequested` variable in the component SHALL evaluate to true, causing the component to render the transfer instructions section instead of the waiting message

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the job state is 2 (SUBMITTED) and the client has not yet requested transfer THEN the freelancer page SHALL CONTINUE TO display "Waiting for Client Review" message

3.2 WHEN the freelancer has already confirmed the transfer (transferConfirmed is true) THEN the page SHALL CONTINUE TO display the "Transfer Confirmed" success message

3.3 WHEN the blockchain query returns an error THEN the page SHALL CONTINUE TO display the error message in the debug info section

3.4 WHEN the job state changes to 4 (APPROVED) after the client approves the work THEN the page SHALL CONTINUE TO update correctly to show the approval status

3.5 WHEN the polling mechanism refetches job data every 10 seconds THEN it SHALL CONTINUE TO query the blockchain without causing performance issues or excessive network requests
