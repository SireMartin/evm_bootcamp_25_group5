import { sepolia } from "viem/chains";
import { Address, createPublicClient, createWalletClient, getContract, } from "viem";
import { http, formatEther, toHex, hexToString, Hex, isAddress } from "viem";
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
  
  // Adding voters by address
  let newVoterAddress  = args[2]
  if(args.length < 2 || !isAddress(newVoterAddress))
    throw new Error("You have to provide an address to the script!");
  console.log(`Adding voter with address ${newVoterAddress}`)
  
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
  console.log("Sender address:", sender.account.address);
  const balance = await publicClient.getBalance({address: sender.account.address,});
  console.log("Sender balance:",formatEther(balance),sender.chain.nativeCurrency.symbol);

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
  
  // Set right to vote to the address provided
  const hash = await sender.writeContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "giveRightToVote",
    args: [ newVoterAddress ]
  });
  console.log(`giveRightToVote to addr hash is ${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
