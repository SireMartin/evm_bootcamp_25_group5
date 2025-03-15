import { sepolia } from "viem/chains";
import { createPublicClient, http, createWalletClient, formatEther, toHex, getContract, hexToString, Hex, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { abi, bytecode } from "../artifacts/contracts/ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.INFURA_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {

  const args = process.argv.slice(0, 3)
  args.forEach(x => console.log(x))
  
  let newVoterAddress  = args[2]
  if(args.length < 2 || !isAddress(newVoterAddress)){
    console.log(`TERMINATING: you have to provide an address to the script`)
    return
  }
  console.log(`adiding voter with address ${newVoterAddress}`)
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);

  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${providerApiKey}`),
  });
  console.log("WalletClient address:", walletClient.account.address);
  const balance = await publicClient.getBalance({
    address: walletClient.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    walletClient.chain.nativeCurrency.symbol
  );

  const contract = getContract({
    abi: abi,
    address: "0x2f10e393076f2637ebfb3cef00ca8faa00cc3288",
    client: publicClient
  });

  for(let i = 0; i < 2; ++i){
    const prop = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "proposals",
        args: [ BigInt(i) ]
    });
    console.log(`proposal ${i} : ${prop}`)
    const [hexName, qty] = prop as [Hex, number];
    console.log(`name is ${hexToString(hexName)} and qty is ${qty}`)
  }
  console.log(`contract address : ${contract.address}`)

  /*const hash = await walletClient.writeContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "giveRightToVote",
    args: [ newVoterAddress ]
  });
  console.log(`giveRightToVote to addr hash is ${hash}`);*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
