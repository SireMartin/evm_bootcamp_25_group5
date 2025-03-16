import { sepolia } from "viem/chains";
import { createPublicClient, http, createWalletClient, formatEther, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.INFURA_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  // Get the delegate address from command line arguments
  const args = process.argv;
  const delegateAddress = args[2];
  
  if (!delegateAddress) {
    console.log("TERMINATING: You must provide an address to delegate to");
    return;
  }

  // Validate the address format
  if (!delegateAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
    console.log("TERMINATING: Invalid Ethereum address format");
    return;
  }

  console.log(`Delegating votes to address: ${delegateAddress}`);
  
  // Setup clients
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });

  console.log("Delegator address:", walletClient.account.address);
  
  const balance = await publicClient.getBalance({
    address: walletClient.account.address,
  });
  
  console.log(
    "Delegator balance:",
    formatEther(balance),
    walletClient.chain.nativeCurrency.symbol
  );

  // Contract instance
  const contract = getContract({
    abi: abi,
    address: "0x2f10e393076f2637ebfb3cef00ca8faa00cc3288", // Your deployed contract address
    client: publicClient
  });

  console.log("Delegating votes...");
  
  // Call delegate function
  const hash = await walletClient.writeContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "delegate",
    args: [delegateAddress]
  });

  console.log(`Delegation transaction hash: ${hash}`);
  
  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Delegation confirmed in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
