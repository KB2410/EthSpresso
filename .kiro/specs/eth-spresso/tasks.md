# Implementation Plan: EthSpresso Web3 Mini-dApp

## Overview

This implementation plan breaks down the EthSpresso Web3 mini-dApp into discrete coding tasks. The project consists of a Solidity smart contract for on-chain tip storage and a Next.js frontend with Web3 integration. Tasks are organized to build incrementally, starting with the smart contract, then the frontend infrastructure, and finally the UI components.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Create root directory structure with `contracts/`, `scripts/`, `frontend/` folders
  - Initialize Hardhat project with TypeScript support
  - Install Hardhat dependencies: `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@nomicfoundation/hardhat-ethers`, `ethers`
  - Configure `hardhat.config.ts` with Solidity compiler version ^0.8.0
  - Initialize Next.js project in `frontend/` directory with TypeScript and Tailwind CSS
  - Install frontend dependencies: `wagmi`, `viem`, `@tanstack/react-query`, `@rainbow-me/rainbowkit`
  - _Requirements: 9.1, 9.2_

- [ ] 2. Implement EthSpresso smart contract
  - [ ] 2.1 Create EthSpresso.sol contract with core structure
    - Define `Memo` struct with sender, amount, message, and timestamp fields
    - Declare `owner` state variable and `memos` array
    - Implement constructor to set owner to msg.sender
    - Define `NewTip` event with indexed sender parameter
    - _Requirements: 1.2, 2.1_
  
  - [ ] 2.2 Implement buyCoffee function
    - Add payable function that accepts memo string parameter
    - Validate msg.value > 0 with require statement and error message
    - Create Memo struct instance with msg.sender, msg.value, memo parameter, and block.timestamp
    - Push memo to memos array
    - Emit NewTip event with all memo data
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ] 2.3 Implement view functions
    - Create getMemos() function returning Memo[] memory
    - Create getOwner() function returning address
    - _Requirements: 2.2, 3.1_
  
  - [ ]* 2.4 Write property test for tip storage integrity
    - **Property 1: Tip Storage Integrity**
    - **Validates: Requirements 1.1, 1.2, 3.2**
    - Use fast-check to generate random memo strings and ETH amounts
    - Verify stored memo matches sent data (sender, amount, message, timestamp)
    - Run 100 iterations
  
  - [ ]* 2.5 Write property test for event emission
    - **Property 2: Event Emission Completeness**
    - **Validates: Requirements 1.3**
    - Use fast-check to generate random tip data
    - Verify NewTip event contains correct sender, amount, message, and timestamp
    - Run 100 iterations
  
  - [ ]* 2.6 Write property test for zero amount rejection
    - **Property 3: Zero Amount Rejection**
    - **Validates: Requirements 1.4**
    - Use fast-check to generate random memo strings
    - Verify all zero ETH transactions revert with correct error message
    - Run 100 iterations
  
  - [ ]* 2.7 Write property test for memo retrieval completeness
    - **Property 4: Memo Retrieval Completeness**
    - **Validates: Requirements 3.2**
    - Use fast-check to generate array of tips (1-10 items)
    - Send all tips and verify getMemos() returns all in correct order
    - Run 100 iterations
  
  - [ ]* 2.8 Write unit tests for edge cases
    - Test deployment sets correct owner
    - Test empty memo string is accepted
    - Test very long memo string (>1000 chars)
    - Test multiple tips from same address
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. Create deployment script
  - Write `scripts/deploy.ts` to deploy EthSpresso contract
  - Log deployed contract address and owner
  - Export contract address and ABI for frontend use
  - _Requirements: 2.1_

- [ ] 4. Checkpoint - Ensure contract tests pass
  - Run `npx hardhat test` and verify all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Set up frontend configuration and providers
  - [ ] 5.1 Create wagmi configuration
    - Create `frontend/lib/wagmi.ts` with chain configuration
    - Configure RPC endpoints for target network
    - Set up wallet connectors (MetaMask, WalletConnect)
    - _Requirements: 8.1, 8.2_
  
  - [ ] 5.2 Create contract configuration
    - Create `frontend/lib/contract.ts` with contract ABI and deployed address
    - Export contract configuration object
    - _Requirements: 8.1_
  
  - [ ] 5.3 Set up TypeScript interfaces
    - Create `frontend/types/index.ts` with Memo, FormattedMemo, TransactionStatus, TransactionState, and TipFormData interfaces
    - _Requirements: 5.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 5.4 Configure root layout with providers
    - Create `frontend/app/layout.tsx` with WagmiProvider and QueryClientProvider
    - Configure React Query with appropriate cache settings
    - Add Tailwind CSS imports to `frontend/app/globals.css`
    - _Requirements: 6.1, 8.1, 9.2_

- [ ] 6. Implement custom hooks for contract interaction
  - [ ] 6.1 Create useContract hook
    - Create `frontend/hooks/useContract.ts`
    - Return contract address and ABI configuration
    - _Requirements: 8.1_
  
  - [ ] 6.2 Create useMemos hook with React Query
    - Create `frontend/hooks/useMemos.ts`
    - Use useQuery with 'memos' query key
    - Call contract's getMemos() function via wagmi's readContract
    - Configure staleTime to 30 seconds for caching
    - Return data, isLoading, error, and refetch
    - _Requirements: 3.1, 6.1, 6.2, 6.3_
  
  - [ ]* 6.3 Write property test for RPC call caching
    - **Property 7: RPC Call Caching**
    - **Validates: Requirements 6.2**
    - Mock RPC calls and track call count
    - Verify subsequent requests within stale time don't trigger new RPC calls
    - Run 100 iterations
  
  - [ ]* 6.4 Write property test for cache revalidation
    - **Property 8: Cache Revalidation**
    - **Validates: Requirements 6.3**
    - Mock time progression past stale time
    - Verify new RPC call is triggered after stale time expires
    - Run 100 iterations
  
  - [ ] 6.5 Create useSendTip hook
    - Create `frontend/hooks/useSendTip.ts`
    - Use wagmi's useWriteContract and useWaitForTransaction hooks
    - Implement sendTip function that calls buyCoffee with memo and ETH value
    - Track transaction status: idle → waiting → pending → success/error
    - Invalidate 'memos' query on successful transaction
    - Return sendTip function, status, error, and txHash
    - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 6.6 Write property test for transaction state machine
    - **Property 9: Transaction State Machine**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - Use fast-check to generate random tip data
    - Monitor state transitions during tip submission
    - Verify states progress: idle → waiting → pending → success/error
    - Run 100 iterations

- [ ] 7. Implement WalletConnect component
  - [ ] 7.1 Create WalletConnect component
    - Create `frontend/components/WalletConnect.tsx`
    - Use wagmi's useAccount and useConnect hooks
    - Show "Connect Wallet" button when disconnected
    - Show abbreviated address and "Disconnect" button when connected
    - Handle connection errors with user-friendly messages
    - Style with Tailwind CSS
    - _Requirements: 8.2, 8.3, 9.2_
  
  - [ ]* 7.2 Write property test for connected wallet display
    - **Property 10: Connected Wallet Display**
    - **Validates: Requirements 8.3**
    - Use fast-check to generate random wallet addresses
    - Verify address is displayed when wallet is connected
    - Run 100 iterations
  
  - [ ]* 7.3 Write unit tests for WalletConnect
    - Test "Connect" button shows when disconnected
    - Test address displays when connected
    - Test error message displays on connection failure
    - _Requirements: 8.2, 8.3_

- [ ] 8. Implement TipForm component
  - [ ] 8.1 Create TipForm component
    - Create `frontend/components/TipForm.tsx`
    - Add controlled inputs for memo (textarea) and amount (number input)
    - Use useSendTip hook for transaction submission
    - Validate memo is not empty and amount > 0
    - Disable form during transaction (isSubmitting state)
    - Clear inputs on successful submission
    - Display inline validation errors
    - Style with Tailwind CSS
    - _Requirements: 1.1, 8.4, 9.2_
  
  - [ ]* 8.2 Write property test for conditional form enablement
    - **Property 11: Conditional Form Enablement**
    - **Validates: Requirements 8.4**
    - Use fast-check to generate boolean wallet connection states
    - Verify form is enabled if and only if wallet is connected
    - Run 100 iterations
  
  - [ ]* 8.3 Write unit tests for TipForm validation
    - Test empty memo shows validation error
    - Test zero amount shows validation error
    - Test negative amount shows validation error
    - Test form clears on successful submission
    - _Requirements: 1.1, 1.4_

- [ ] 9. Implement TransactionStatus component
  - [ ] 9.1 Create TransactionStatus component
    - Create `frontend/components/TransactionStatus.tsx`
    - Accept status, error, and txHash props
    - Display appropriate message for each status: idle, waiting, pending, success, error
    - Show loading spinner for waiting and pending states
    - Show success checkmark icon on confirmation
    - Show error icon and message on failure
    - Provide Etherscan link when txHash is available
    - Style with Tailwind CSS
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.2_
  
  - [ ]* 9.2 Write unit tests for TransactionStatus
    - Test correct message displays for each status
    - Test Etherscan link appears when txHash provided
    - Test error message displays when status is error
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Implement MemoList component
  - [ ] 10.1 Create MemoList component
    - Create `frontend/components/MemoList.tsx`
    - Use useMemos hook to fetch memo data
    - Display loading spinner while isLoading is true
    - Display error message if fetch fails
    - Render memo cards in reverse chronological order (newest first)
    - Format ETH amounts using formatEther from viem
    - Format timestamps as readable date/time strings
    - Abbreviate sender addresses (first 6 + last 4 chars)
    - Style memo cards with Tailwind CSS
    - _Requirements: 5.1, 5.2, 9.2_
  
  - [ ]* 10.2 Write property test for memo display completeness
    - **Property 5: Memo Display Completeness**
    - **Validates: Requirements 5.1**
    - Use fast-check to generate arrays of memos (0-20 items)
    - Verify all memos are rendered in the display list
    - Run 100 iterations
  
  - [ ]* 10.3 Write property test for memo field display
    - **Property 6: Memo Field Display**
    - **Validates: Requirements 5.2**
    - Use fast-check to generate random memo data
    - Verify displayed output contains sender, amount, message, and timestamp
    - Run 100 iterations
  
  - [ ]* 10.4 Write unit tests for MemoList
    - Test loading state displays spinner
    - Test error state displays error message
    - Test empty memo list displays appropriate message
    - Test memo formatting (address abbreviation, ETH conversion, timestamp)
    - _Requirements: 5.1, 5.2_

- [ ] 11. Create main page component
  - [ ] 11.1 Implement main page layout
    - Create `frontend/app/page.tsx`
    - Import and compose WalletConnect, TipForm, TransactionStatus, and MemoList components
    - Create responsive layout with header, main content area, and footer
    - Add application title and description
    - Style with Tailwind CSS for mobile and desktop viewports
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 11.2 Write property test for responsive layout
    - **Property 12: Responsive Layout**
    - **Validates: Requirements 9.3**
    - Use fast-check to generate viewport sizes (mobile and desktop ranges)
    - Verify no horizontal scrolling or overlapping elements
    - Run 100 iterations
  
  - [ ]* 11.3 Write integration tests for page
    - Test wallet connection enables TipForm
    - Test successful tip submission updates MemoList
    - Test transaction error displays in TransactionStatus
    - _Requirements: 7.3, 8.4_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Run `npm run test` in frontend directory
  - Verify all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Smart contract tasks (1-4) should be completed before frontend tasks (5-12)
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses Solidity for smart contracts and TypeScript for the Next.js frontend
- All Web3 interactions use wagmi and viem libraries
- React Query handles data caching to minimize RPC calls
- Tailwind CSS provides utility-first styling throughout the application
