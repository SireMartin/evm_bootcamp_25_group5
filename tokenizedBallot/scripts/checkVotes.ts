import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

const tokenContractName = "MyToken";
const tokenContractAddress = "0xff198373b61fc6132efe421a47637a17c75986c8";
const ballotContractName = "TokenizedBallot";
const ballotContractAddress = "";                               // ADD <<<---

async function main() {

    // Creating publicClient and WalletClient  
    const publicClient = await viem.getPublicClient();
    const [deployer] = await viem.getWalletClients();
//    console.log(`\nCurrent address is ${deployer.account.address}`);
    console.log(`\nThe current blocknumber is ${await publicClient.getBlockNumber()}`);

    // NEED TO DEPLOY THE TOKENIZEDBALLOT CONTRACT AND USE ITS ADDRESS

    // Interacting with the contracts
    const ballotContract = await viem.getContractAt(ballotContractName, ballotContractAddress);
    const tokenContract = await viem.getContractAt(tokenContractName, tokenContractAddress);
    console.log(`\nFetched MyToken contract at address ${tokenContractAddress}`);
    console.log(`Fetched TokenizedBallot contract at address ${ballotContractAddress}`);

    // Checking remaining voting power
    console.log(`\nRemaining voting power is ${await ballotContract.read.getRemainingVotingPower([deployer.account.address])} at block ${await publicClient.getBlockNumber()}`);

    // Checking past votes
    const lastBlockNumber = await publicClient.getBlockNumber();
    for (let index = lastBlockNumber - 1n; index > 0n; index--) {
        const pastVotes = await tokenContract.read.getPastVotes([
        deployer.account.address,
        index,
        ]);
        console.log(
        `Account ${
            deployer.account.address
        } had ${pastVotes.toString()} units of voting power at block ${index}\n`
        );
    }

}