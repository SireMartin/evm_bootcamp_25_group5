import { ethers } from "hardhat";
import { Shebang } from "../typechain-types";

async function main() {
  // Get the contract instance
  const shebangContract = await ethers.getContract("Shebang") as Shebang;
  
  // The address that will receive the MINTER_ROLE
  const apiServiceAddress = process.env.API_SERVICE_ADDRESS;
  
  if (!apiServiceAddress) {
    console.error("Please set API_SERVICE_ADDRESS in your environment variables");
    return;
  }
  // Get the MINTER_ROLE hash
  const MINTER_ROLE = await shebangContract.MINTER_ROLE();

  // Grant the role
  const tx = await shebangContract.grantRole(MINTER_ROLE, apiServiceAddress);
  await tx.wait();

  console.log(`Granted MINTER_ROLE to ${apiServiceAddress}`);
  console.log(`Transaction hash: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 