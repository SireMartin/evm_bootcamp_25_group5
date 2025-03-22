import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

async function main(){
    const publicClient = await viem.getPublicClient();
    console.log(`the current blocknumber is ${await publicClient.getBlockNumber()}`);

    const [delegator] = await viem.getWalletClients();
    console.log(`self delegator address is ${delegator.account.address}`);

    const tokenContract = await viem.getContractAt("MyToken", "0xff198373b61fc6132efe421a47637a17c75986c8");
    console.log(`fetched contract at address ${tokenContract.address}`);

    console.log(`voting power before self delegation is ${formatEther(await tokenContract.read.getVotes([delegator.account.address]))}`);
    const selfDelegationTx = await tokenContract.write.delegate([delegator.account.address]);
    const selfDelegationTxReceipt = await publicClient.waitForTransactionReceipt({hash: selfDelegationTx});
    console.log(`voting power enabled for address ${delegator.account.address} in block ${selfDelegationTxReceipt.blockNumber}`);
    console.log(`voting power after self delegation is ${formatEther(await tokenContract.read.getVotes([delegator.account.address]))}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
