import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

const MINT_VALUE = parseEther("5");
const acc1 = "0x81D51adbC06827784cE72184Fce6861FFF31D16C";      //trust
const acc2 = "0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E";      //artur
const acc3 = "0xC35c40Bd72F7528893a259dbf40Fcb266002663e";      //marco
const acc4 = "0x0936203E154ed749c099fc585770063fAD30BE35";      //me

async function main() {

    // Creating publicClient and WalletClient  
    const publicClient = await viem.getPublicClient();
    const [deployer] = await viem.getWalletClients();
    const tokenContract = await viem.deployContract("MyToken");
    console.log(`\nTokenContract deployed at address: ${tokenContract.address}`);
    console.log(`Deployer address is ${deployer.account.address}`);
    console.log(`The current blocknumber is ${await publicClient.getBlockNumber()}\n`);

    // Minting tokens to team members

    // Trust
    const mintTxAcc1 = await tokenContract.write.mint([acc1, MINT_VALUE]);
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc1 });
//    console.log(`Minted ${MINT_VALUE.toString()} decimal units of MyToken to account ${acc1}`);
    console.log(`Minted ${formatEther(MINT_VALUE)} tokens of MyToken to account ${acc1}`);
    
    // Artur
    const mintTxAcc2 = await tokenContract.write.mint([acc2, MINT_VALUE]);
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc2 });
//    console.log(`Minted ${MINT_VALUE.toString()} decimal units of MyToken to account ${acc2}`);
    console.log(`Minted ${formatEther(MINT_VALUE)} tokens of MyToken to account ${acc2}`);

    // Marco
    const mintTxAcc3 = await tokenContract.write.mint([acc3, MINT_VALUE]);
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc3 });
//    console.log(`Minted ${MINT_VALUE.toString()} decimal units of MyToken to account ${acc3}`);
    console.log(`Minted ${formatEther(MINT_VALUE)} tokens of MyToken to account ${acc3}`);

    // Me
    const mintTxAcc4 = await tokenContract.write.mint([acc4, MINT_VALUE]);
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc4 });
//    console.log(`Minted ${MINT_VALUE.toString()} decimal units of MyToken to account ${acc4}`);
    console.log(`Minted ${formatEther(MINT_VALUE)} tokens of MyToken to account ${acc4}`);

    // Retrieving info about token account balance
    console.log(`\nBalance of Trust after minting is ${formatEther(await tokenContract.read.balanceOf([acc1]))}`);
    console.log(`Balance of Artur after minting is ${formatEther(await tokenContract.read.balanceOf([acc2]))}`);
    console.log(`Balance of Marco after minting is ${formatEther(await tokenContract.read.balanceOf([acc3]))}`);
    console.log(`My balance after minting is ${formatEther(await tokenContract.read.balanceOf([acc4]))}`);

    // Checking voting power
    console.log(`\nVoting power for Trust is ${await tokenContract.read.getVotes([acc1])} before self delegation`);
    console.log(`Voting power for Artur is ${await tokenContract.read.getVotes([acc2])} before self delegation`);
    console.log(`Voting power for Marco is ${await tokenContract.read.getVotes([acc3])} before self delegation`);
    console.log(`My voting power is ${await tokenContract.read.getVotes([acc4])} before self delegation\n`);
        
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
