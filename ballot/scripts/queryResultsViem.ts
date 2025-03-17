import { sepolia } from "viem/chains";
import { createPublicClient, createWalletClient, getContract, } from "viem";
import { http, formatEther, toHex, hexToString, Hex, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi, bytecode } from "../artifacts/contracts/ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.INFURA_API_KEY || "";

async function main() {

  // Creating a public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  // Retrieving the deployed contract address
  const contract = getContract({
    abi: abi,
    address: "0x2f10e393076f2637ebfb3cef00ca8faa00cc3288",
    client: publicClient
  });
  console.log(`Contract address : ${contract.address}`)

  // Querying results
  console.log("\n--- Ballot Contract Query Results ---\n");

  // Get chairperson
  const chairperson = await publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "chairperson"
  });
  console.log("Chairperson:", chairperson);

  // Get winning proposal
  const winningProposalIndex = await publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "winningProposal"
  });
  console.log("\nWinning Proposal Index:", winningProposalIndex);

  // Get winning proposal name
  const winnerName = await publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "winnerName"
  }) as Hex;
  console.log("Winning Proposal Name:", hexToString(winnerName));

  // Query all proposals
  console.log("\n--- All Proposals ---");
  let index = 0;
  while (true) {
    try {
      const proposal = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "proposals",
        args: [BigInt(index)]
      }) as [Hex, bigint];

      const [name, voteCount] = proposal;
      console.log(`\nProposal ${index}:`);
      console.log("Name:", hexToString(name));
      console.log("Vote Count:", voteCount.toString());
      
      index++;
    } catch (error) {
      // Break the loop when we've read all proposals
      break;
    }
  }

  // If an address is provided as argument, query its voting info
  const voterAddress = process.argv[2];
  if (voterAddress) {
    console.log("\n--- Voter Information ---");
    try {
      const voter = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "voters",
        args: [voterAddress]
      }) as [bigint, boolean, string, bigint];

      const [weight, voted, delegate, vote] = voter;
      console.log(`\nVoter Address: ${voterAddress}`);
      console.log("Weight:", weight.toString());
      console.log("Has Voted:", voted);
      console.log("Delegated To:", delegate === "0x0000000000000000000000000000000000000000" ? "Nobody" : delegate);
      console.log("Voted for Proposal:", voted ? vote.toString() : "Has not voted");
    } catch (error) {
      console.log("Error querying voter information:", (error as Error).message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
