# Requirements Document

## Introduction

BrewBid is a Web3 mini-dApp that enables users to send ETH tips with personalized text memos. The system consists of a Solidity smart contract for on-chain tip storage and a Next.js frontend for user interaction. The application prioritizes user experience through efficient data caching and clear transaction state feedback.

## Glossary

- **BrewBid_Contract**: The Solidity smart contract that handles ETH tip transactions and memo storage
- **Memo**: A text message attached to an ETH tip transaction
- **Tip**: An ETH payment sent by a user through the BrewBid_Contract
- **Frontend**: The Next.js web application that provides the user interface
- **Wallet**: The user's Web3 wallet (e.g., MetaMask) used for signing transactions
- **RPC_Call**: Remote Procedure Call to the Ethereum blockchain network
- **Transaction_State**: The current status of a blockchain transaction (pending, confirmed, or failed)

## Requirements

### Requirement 1: Accept ETH Tips with Memos

**User Story:** As a user, I want to send an ETH tip with a personalized message, so that I can support the project and share my thoughts.

#### Acceptance Criteria

1. WHEN a user sends a transaction with ETH greater than 0 and a text memo, THE BrewBid_Contract SHALL accept the tip and store the memo
2. THE BrewBid_Contract SHALL store each memo with the sender address, tip amount, and timestamp in an array
3. WHEN a tip transaction is successfully processed, THE BrewBid_Contract SHALL emit a NewTip event containing sender address, tip amount, memo text, and timestamp
4. IF a user attempts to send a tip with 0 ETH, THEN THE BrewBid_Contract SHALL revert the transaction

### Requirement 2: Track Contract Ownership

**User Story:** As a contract deployer, I want the contract to record the deployment owner, so that ownership can be verified.

#### Acceptance Criteria

1. WHEN THE BrewBid_Contract is deployed, THE BrewBid_Contract SHALL record the deployer address as the owner
2. THE BrewBid_Contract SHALL provide a public function to retrieve the owner address

### Requirement 3: Retrieve Stored Memos

**User Story:** As a user, I want to view all previously sent tips and memos, so that I can see the community's messages.

#### Acceptance Criteria

1. THE BrewBid_Contract SHALL provide a public function to retrieve all stored memos
2. WHEN the memo retrieval function is called, THE BrewBid_Contract SHALL return an array containing all memo data including sender addresses, tip amounts, memo texts, and timestamps

### Requirement 4: Verify Contract Behavior Through Tests

**User Story:** As a developer, I want comprehensive tests for the smart contract, so that I can ensure the contract behaves correctly.

#### Acceptance Criteria

1. THE Test_Suite SHALL include a test that verifies the deployment owner is correctly recorded
2. THE Test_Suite SHALL include a test that verifies a successful tip transaction stores the memo and emits the NewTip event
3. THE Test_Suite SHALL include a test that verifies a transaction with 0 ETH reverts
4. THE Test_Suite SHALL use Hardhat as the testing framework

### Requirement 5: Display Memos in Frontend

**User Story:** As a user, I want to see all tips and memos in the web interface, so that I can read community messages without technical knowledge.

#### Acceptance Criteria

1. THE Frontend SHALL display a list of all memos retrieved from the BrewBid_Contract
2. WHEN displaying memos, THE Frontend SHALL show the sender address, tip amount in ETH, memo text, and timestamp for each entry
3. THE Frontend SHALL use Tailwind CSS for styling the memo display

### Requirement 6: Minimize Blockchain RPC Calls

**User Story:** As a user, I want the application to load quickly and efficiently, so that I don't experience delays or excessive network usage.

#### Acceptance Criteria

1. THE Frontend SHALL use React Query for client-side caching of memo data
2. WHEN memo data is fetched, THE Frontend SHALL cache the results to avoid redundant RPC_Calls
3. THE Frontend SHALL revalidate cached data according to a configured stale time policy

### Requirement 7: Provide Clear Transaction Feedback

**User Story:** As a user, I want to see clear status updates during transactions, so that I understand what's happening and when to take action.

#### Acceptance Criteria

1. WHEN a user initiates a tip transaction, THE Frontend SHALL display a "Waiting for Wallet" state until the user confirms in their Wallet
2. WHEN a transaction is submitted to the blockchain, THE Frontend SHALL display a "Transaction Pending" state until the transaction is confirmed
3. WHEN a transaction is confirmed, THE Frontend SHALL display a success message and update the memo list
4. IF a transaction fails or is rejected, THEN THE Frontend SHALL display an error message with the failure reason

### Requirement 8: Integrate Web3 Wallet Connection

**User Story:** As a user, I want to connect my Web3 wallet to the application, so that I can send tips and interact with the smart contract.

#### Acceptance Criteria

1. THE Frontend SHALL use wagmi and viem libraries for Web3 integration
2. THE Frontend SHALL provide a wallet connection interface for users to connect their Wallet
3. WHEN a Wallet is connected, THE Frontend SHALL display the connected wallet address
4. THE Frontend SHALL enable the tip submission interface only when a Wallet is connected

### Requirement 9: Build Frontend with Next.js

**User Story:** As a developer, I want the frontend built with modern web technologies, so that the application is performant and maintainable.

#### Acceptance Criteria

1. THE Frontend SHALL be built using the Next.js framework
2. THE Frontend SHALL use Tailwind CSS for styling
3. THE Frontend SHALL implement responsive design for mobile and desktop viewports
