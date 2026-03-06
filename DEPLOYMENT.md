# EthSpresso Deployment Guide

## Prerequisites

1. **Get Sepolia ETH**
   - Visit a Sepolia faucet:
     - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
     - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - Request test ETH to your MetaMask wallet

2. **Get an RPC URL**
   - Sign up for a free account at:
     - [Alchemy](https://www.alchemy.com/) - Recommended
     - [Infura](https://www.infura.io/)
   - Create a new app/project for Sepolia
   - Copy your API key/RPC URL

## Setup Environment Variables

1. **Create .env file** (copy from .env.example):
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file** with your credentials:
   ```env
   SEPOLIA_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
   PRIVATE_KEY="your_metamask_private_key_here"
   ETHERSCAN_API_KEY="your_etherscan_api_key" # Optional
   ```

3. **Get your MetaMask private key**:
   - Open MetaMask
   - Click the three dots → Account Details → Show Private Key
   - ⚠️ **NEVER share or commit this key!**

## Deploy to Sepolia

1. **Compile the contract**:
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Sepolia**:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

3. **Save the contract address**:
   - Copy the deployed contract address from the output
   - You'll need this for the frontend!

## Update Frontend

1. **Open `frontend/app/page.tsx`**

2. **Update CONTRACT_ADDRESS** (line 11):
   ```typescript
   const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
   ```

3. **Save the file**

## Verify Contract on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Test Deployment

1. **Start the frontend**:
   ```bash
   npm run frontend:dev
   ```

2. **Open http://localhost:3000**

3. **Connect your MetaMask wallet** (make sure you're on Sepolia network)

4. **Send a test tip!**

## Deploy to Local Hardhat Network (for testing)

1. **Start local node**:
   ```bash
   npx hardhat node
   ```

2. **Deploy to local network** (in a new terminal):
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. **Update frontend** to use the local contract address

4. **Add Hardhat network to MetaMask**:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

## Troubleshooting

### "Insufficient funds" error
- Make sure you have enough Sepolia ETH in your wallet
- Get more from a faucet

### "Invalid API key" error
- Check your SEPOLIA_URL in .env
- Make sure you copied the full URL with API key

### "Private key" error
- Verify your PRIVATE_KEY in .env is correct
- Make sure it doesn't have "0x" prefix (Hardhat adds it automatically)

### Frontend not connecting
- Make sure MetaMask is on Sepolia network
- Check that CONTRACT_ADDRESS in page.tsx is correct
- Clear browser cache and reload

## Security Notes

⚠️ **IMPORTANT**:
- Never commit your .env file
- Never share your private key
- Use a separate wallet for testing (not your main wallet)
- The .env file is already in .gitignore

## Next Steps

After successful deployment:
1. ✅ Update README with deployed contract address
2. ✅ Test all functionality on Sepolia
3. ✅ Take screenshots for documentation
4. ✅ Deploy frontend to Vercel/Netlify (optional)
