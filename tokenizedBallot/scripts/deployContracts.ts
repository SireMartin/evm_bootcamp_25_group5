import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

async function main(){
    const [deployer] = await viem.getWalletClients();
    console.log(`deployer address is ${deployer.account.address}`)

    const publicClient = await viem.getPublicClient();
    console.log(`the current blocknumber is ${await publicClient.getBlockNumber()}`);
    
    const tokenContract = await viem.deployContract("MyToken");
    console.log(`tokencontract deployed at address ${tokenContract.address}`);
    
    await tokenContract.write.mint(["0x81D51adbC06827784cE72184Fce6861FFF31D16C", parseEther("5")]); //trust
    await tokenContract.write.mint(["0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E", parseEther("5")]); //artur
    await tokenContract.write.mint(["0xC35c40Bd72F7528893a259dbf40Fcb266002663e", parseEther("5")]); //marco
    await tokenContract.write.mint(["0x0936203E154ed749c099fc585770063fAD30BE35", parseEther("5")]); //me
    console.log("Distributed 5 tokens to every team member");

    console.log(`balance trust after minting is ${formatEther(await tokenContract.read.balanceOf(["0x81D51adbC06827784cE72184Fce6861FFF31D16C"]))}`);
    console.log(`balance artur after minting is ${formatEther(await tokenContract.read.balanceOf(["0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E"]))}`);
    console.log(`balance marco after minting is ${formatEther(await tokenContract.read.balanceOf(["0xC35c40Bd72F7528893a259dbf40Fcb266002663e"]))}`);
    console.log(`balance me after minting is ${formatEther(await tokenContract.read.balanceOf(["0x0936203E154ed749c099fc585770063fAD30BE35"]))}`);

    console.log(`voting power for trust is ${await tokenContract.read.getVotes(["0x81D51adbC06827784cE72184Fce6861FFF31D16C"])}`);
    console.log(`voting power for artur is ${await tokenContract.read.getVotes(["0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E"])}`);
    console.log(`voting power for marco is ${await tokenContract.read.getVotes(["0xC35c40Bd72F7528893a259dbf40Fcb266002663e"])}`);
    console.log(`voting power for me is ${await tokenContract.read.getVotes(["0x0936203E154ed749c099fc585770063fAD30BE35"])}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
