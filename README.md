# EthSpresso ☕

A Web3 mini-dApp that enables users to send ETH tips with personalized text memos.

## Smart Contract Tests - All Passing ✅

![Tests Passing](./public/tests-passing.png)

The BuyMeACoffee smart contract includes 3 comprehensive tests:
1. **Deployment Test** - Verifies the contract owner is set correctly
2. **State Change & Event Emission** - Verifies tips are accepted, memos are stored, and events are emitted
3. **Revert/Error Handling** - Verifies transactions with 0 ETH are rejected

All tests pass successfully!

## Project Structure

```
eth-spresso/
├── contracts/          # Solidity smart contracts
│   └── test/          # Contract tests
├── scripts/           # Deployment scripts
├── frontend/          # Next.js frontend application
├── hardhat.config.ts  # Hardhat configuration
└── package.json       # Root package.json
```

## Setup

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Development

### Smart Contract Development

Compile contracts:
```bash
npm run compile
```

Run tests:
```bash
npm test
```

Start local Hardhat node:
```bash
npm run node
```

Deploy contracts:
```bash
npm run deploy
```

### Frontend Development

Start the development server:
```bash
npm run frontend:dev
```

Build for production:
```bash
npm run frontend:build
```

## Technology Stack

### Smart Contract
- Solidity ^0.8.20
- Hardhat 2.22.0
- Ethers.js v6
- Chai (testing framework)
- TypeScript

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- wagmi v3 + viem v2 (Web3 integration)
- React Query v5 (data caching)
- RainbowKit (wallet connection)

## Features

### Smart Contract (Completed ✅)
- ✅ Send ETH tips with personalized name and message
- ✅ Store memos on-chain with sender address and timestamp
- ✅ Event emission for frontend indexing
- ✅ Owner withdrawal functionality
- ✅ Input validation (rejects 0 ETH transactions)
- ✅ Comprehensive test coverage (3/3 tests passing)

### Frontend (Completed ✅)
- ✅ Wallet connection (Connect/Disconnect)
- ✅ Real-time transaction status feedback
- ✅ Efficient data caching with React Query
- ✅ Responsive design for mobile and desktop
- ✅ View all tips and messages on-chain
- ✅ Beautiful gradient UI with Tailwind CSS

## Deployment

### Deploy Smart Contract to Sepolia

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick steps:**
1. Get Sepolia ETH from a faucet
2. Create `.env` file with your credentials
3. Deploy: `npx hardhat run scripts/deploy.ts --network sepolia`
4. Copy the contract address
5. Update `CONTRACT_ADDRESS` in `frontend/app/page.tsx`

### Deploy Frontend to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete EthSpresso dApp"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [Vercel.com](https://vercel.com)
   - Log in with GitHub
   - Click "Add New Project"
   - Select your `ethspresso` repository
   - Click "Deploy"
   - Vercel will auto-detect Next.js and deploy

3. **Get your live URL** from Vercel dashboard

### Verify Deployment

1. Visit your Vercel URL
2. Connect MetaMask (switch to Sepolia network)
3. Send a test tip
4. View your memo in the list

## Project Links

- **Live Demo**: [Your Vercel URL here]
- **Contract on Sepolia**: [Your Etherscan link here]
- **GitHub Repository**: [Your repo URL here]

## License

ISC
