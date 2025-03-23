import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

const tokenContractName = "MyToken";
const tokenContractAddress = "0xff198373b61fc6132efe421a47637a17c75986c8";

async function main() {

    // Creating publicClient and WalletClient
    const publicClient = await viem.getPublicClient();
    const [delegator] = await viem.getWalletClients();
    console.log(`\nSelf delegator address is ${delegator.account.address}`);
    console.log(`The current blocknumber is ${await publicClient.getBlockNumber()}`);

    // Interacting with the contract
    const tokenContract = await viem.getContractAt(tokenContractName, tokenContractAddress);
    console.log(`Fetched contract at address ${tokenContract.address}`);

    // Checking voting power
    console.log(`\nVoting power before self delegation is ${formatEther(await tokenContract.read.getVotes([delegator.account.address]))}`);

    // Self-delegation transaction
    const selfDelegationTx = await tokenContract.write.delegate([delegator.account.address]);
    const selfDelegationTxReceipt = await publicClient.waitForTransactionReceipt({hash: selfDelegationTx});
    console.log(`Voting power after self delegation is ${formatEther(await tokenContract.read.getVotes([delegator.account.address]))}`);
    console.log(`Voting power enabled for address ${delegator.account.address} in block ${selfDelegationTxReceipt.blockNumber}\n`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
