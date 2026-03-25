# EthSpresso ☕ - Real-Time Decentralized Auction dApp

**Stellar Journey to Mastery — Blue Belt (Level 5) Submission**

EthSpresso is a real-time decentralized auction platform built on the Stellar network leveraging Soroban smart contracts. It allows users to list digital items for auction with strict time limits, while buyers connect their Freighter wallets to place secure, escrowed bids. 

## 🔗 Official Submission Links
* **Live Demo:** [Insert your Vercel/Netlify link here]
* **Demo Video:** [Insert your YouTube/Loom link here]
* **Feedback Document:** [Link to your uploaded user_feedback.xlsx file]

---

## 🏗️ Architecture & Technical Scope

EthSpresso focuses on seamless frontend-to-backend integration within the Stellar ecosystem. 

* **Frontend (Next.js & Tailwind CSS):** Listens to Stellar network RPC polling to provide real-time UI updates on the current highest bid without requiring page refreshes.
* **Wallet Integration:** Utilizes `@stellar/freighter-api` to authenticate users and securely sign `xdr` transactions.
* **Smart Contract (Soroban/Rust):** Acts as a trustless escrow. It locks the highest bidder's funds and utilizes a "pull" refund mechanism to allow outbid users to securely withdraw their locked funds. Once the block time expires, the contract executes final settlement.

*(Optional: Insert a screenshot of your architecture diagram here)*

---

## 👥 User Validation (Blue Belt Requirement)

To ensure a polished and frictionless user experience, EthSpresso was tested by 5 real testnet users who executed both the "Seller" and "Bidder" flows. 

### Verifiable Testnet Users
1. `[User 1 Wallet Address starting with G...]` - [Link to Stellar Expert Explorer]
2. `[User 2 Wallet Address starting with G...]` - [Link to Stellar Expert Explorer]
3. `[User 3 Wallet Address starting with G...]` - [Link to Stellar Expert Explorer]
4. `[User 4 Wallet Address starting with G...]` - [Link to Stellar Expert Explorer]
5. `[User 5 Wallet Address starting with G...]` - [Link to Stellar Expert Explorer]

### 🔄 Feedback Iteration & Improvement
Based on the collected user feedback (see linked Excel sheet above), users noted that there was no visual indication that a bid transaction was processing on the network.

**Implementation:** In the next phase of development, I evolved the project by implementing a loading state on the bidding button that disables the input and provides visual feedback during RPC simulation and network submission.

**Proof of Work (Git Commit):** 🔗 [Insert the direct link to the specific GitHub commit containing this fix]

---

## 💻 Local Setup & Deployment

### Prerequisites
* Node.js (v18+)
* Rust & Soroban CLI
* Freighter Wallet Browser Extension

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Contract Deployment (Testnet)
```bash
soroban contract build
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ethspresso_auction.wasm \
  --source [YOUR_TESTNET_IDENTITY] \
  --network testnet
```
