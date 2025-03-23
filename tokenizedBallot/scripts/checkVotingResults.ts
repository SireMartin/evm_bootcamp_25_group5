import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient, Hex, hexToString } from "viem";

async function main(){
    // const [deployer] = await viem.getWalletClients();
    // console.log(`deployer address is ${deployer.account.address}`)
    
    const tokenContract = await viem.getContractAt("MyToken", "0xff198373b61fc6132efe421a47637a17c75986c8");
    const ballotContract = await viem.getContractAt("TokenizedBallot", "0xe73d2eaac33cc13acdfaad2bf8a536600aadee3a");
    
    for(let i = 0n; i < 2n; ++i){
        const iterProposal = (await ballotContract.read.proposals([i])) as [Hex, bigint];
        console.log(`${hexToString(iterProposal[0])} qty votes is ${formatEther(iterProposal[1])} (proposal index ${i})`)
    }

    console.log(`the winning proposal index is ${await ballotContract.read.winningProposal()}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
