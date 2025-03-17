import { sepolia } from "viem/chains";
import { createPublicClient, createWalletClient, getContract, } from "viem";
import { http, formatEther, toHex, hexToString, Hex, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi, bytecode } from "../artifacts/contracts/ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.INFURA_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {

  // Get the delegate address from command line arguments
  const args = process.argv;
  const delegateAddress = args[2];
  
  // Check if delegated address is provided
  if (!delegateAddress)
    throw new Error("You must provide an address to delegate to!");

  // Validate the address format
  if (!delegateAddress.match(/^0x[0-9a-fA-F]{40}$/))
    throw new Error("Invalid Ethereum address format");
  console.log(`Delegating votes to address: ${delegateAddress}`);
  
  // Creating a public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });

  // Creating a wallet client
  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const delegator = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  console.log("Delegator address:", delegator.account.address);
  const balance = await publicClient.getBalance({address: delegator.account.address,});
  console.log("Delegator balance:",formatEther(balance),delegator.chain.nativeCurrency.symbol);

  // Check if delegated address is not equal to delegator
  if (delegateAddress == delegator.account.address)
    throw new Error("Self-delegation is disallowed.");

  // Retrieving the deployed contract address
  const contract = getContract({
    abi: abi,
    address: "0x2f10e393076f2637ebfb3cef00ca8faa00cc3288",
    client: publicClient
  });

  // Reading informations from the deployed contract

  // Voters info
//  const voter = await publicClient.readContract({
//    address: contract.address,
//    abi: contract.abi,
//    functionName: "voters",
//    args: [ delegator.account.address ]
//  });
//  const [weight, voted, delegate, vote] = voter as [number, boolean, Address, number];
////  console.log(`Voter ${delegator.account.address} has:`)
////  console.log(`Weight accumulated by delegation = ${weight}`)
////  console.log(`Already voted? ${voted}`)
////  console.log(`Delegated address ${delegate}`)
////  console.log(`Index of the voted proposal = ${vote}`)

// Check if delegator has right to vote
//if (weight == 0)
//  throw new Error("Delegator has no right to vote.");
  
  // Calling delegate function
  console.log("Delegating votes...");
  const hash = await delegator.writeContract({
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
