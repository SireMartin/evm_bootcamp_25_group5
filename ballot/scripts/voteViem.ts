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

  // Providing proposals
  const args = process.argv.slice(0,3)
  if (!args || args.length < 1)
    throw new Error("Proposals not provided");
  args.forEach(x => console.log(x))
  
  let proposalIndex = args[2]
  if(args.length < 2 || !Number.isInteger(Number(proposalIndex)))
    throw new Error("You have to provide a proposal index!");

  console.log(`Adding voter with address ${proposalIndex}`)

  // Creating a public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  // Creating a wallet client
  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const sender = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  console.log("Voter address:", sender.account.address);
  const balance = await publicClient.getBalance({address: sender.account.address,});
  console.log("Voter balance:",formatEther(balance),sender.chain.nativeCurrency.symbol);

  // Retrieving the deployed contract address
  const contract = getContract({
    abi: abi,
    address: "0x2f10e393076f2637ebfb3cef00ca8faa00cc3288",
    client: publicClient
  });
  console.log(`Contract address : ${contract.address}`)

  // Reading informations from the deployed contract

  // Proposals info
  for(let i = 0; i < 2; ++i) {
    const prop = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "proposals",
        args: [ BigInt(i) ]
    });
    console.log(`Proposal ${i} : ${prop}`)
    const [hexName, qty] = prop as [Hex, number];
    console.log(`Proposal name is ${hexToString(hexName)} and number of votes are ${qty}`)
  }

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

  // Let the user vote
  const hash = await sender.writeContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "vote",
    args: [ proposalIndex ]
  });
  console.log(`vote to addr hash is ${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
