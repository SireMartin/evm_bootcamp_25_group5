import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

async function main(){
    const publicClient = await viem.getPublicClient();
    console.log(`the current blocknumber is ${await publicClient.getBlockNumber()}`);

    const [voter] = await viem.getWalletClients();
    console.log(`self delegator address is ${voter.account.address}`);

    const ballotContract = await viem.getContractAt("TokenizedBallot", "0xe73d2eaac33cc13acdfaad2bf8a536600aadee3a");
    console.log(`fetched contract at address ${ballotContract.address}`);

    console.log(`voting power for account before voting = ${await ballotContract.read.getRemainingVotingPower([voter.account.address])}`);
    //vote 3 tokens on destination Brazil
    const voteBrazilTx = await ballotContract.write.vote([1n, parseEther("3")]);
    console.log(`voted 3 tokens on brazil with tx ${voteBrazilTx}`);
    console.log(`voting power for account after voting on brazil = ${await ballotContract.read.getRemainingVotingPower([voter.account.address])}`);
    //vote 2 tokens on destination Argentina
    const voteArgentinaTx = await ballotContract.write.vote([0n, parseEther("3")]);
    console.log(`voted 2 tokens on argentina with tx ${voteArgentinaTx}`);
    console.log(`voting power for account after voting on argentian = ${await ballotContract.read.getRemainingVotingPower([voter.account.address])}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
