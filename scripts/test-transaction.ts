const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x89fFbaeDFcCC9FC357B63CE2C991962Edf3f6045";
  
  // Get the contract
  const BuyMeACoffee = await ethers.getContractAt("BuyMeACoffee", contractAddress);
  
  console.log("Sending a test coffee tip...");
  
  // Send a coffee tip
  const tx = await BuyMeACoffee.buyCoffee(
    "Test User",
    "This is a test message from Hardhat!",
    { value: ethers.parseEther("0.001") }
  );
  
  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  await tx.wait();
  
  console.log("✅ Transaction confirmed!");
  
  // Get all memos
  const memos = await BuyMeACoffee.getMemos();
  console.log("\n📝 All memos:");
  memos.forEach((memo: any, index: number) => {
    console.log(`\nMemo ${index + 1}:`);
    console.log(`  From: ${memo.from}`);
    console.log(`  Name: ${memo.name}`);
    console.log(`  Message: ${memo.message}`);
    console.log(`  Timestamp: ${new Date(Number(memo.timestamp) * 1000).toLocaleString()}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
