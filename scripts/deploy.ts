import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BuyMeACoffee contract...");

  // Get the contract factory
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  
  // Deploy the contract
  const buyMeACoffee = await BuyMeACoffee.deploy();
  
  // Wait for deployment to finish
  await buyMeACoffee.waitForDeployment();
  
  const contractAddress = await buyMeACoffee.getAddress();
  const owner = await buyMeACoffee.owner();

  console.log("\n✅ BuyMeACoffee deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Owner Address:", owner);
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in frontend/app/page.tsx");
  console.log("3. Verify your contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
