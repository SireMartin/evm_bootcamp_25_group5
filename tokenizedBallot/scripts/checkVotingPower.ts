import { viem } from "hardhat";
import { parseEther, formatEther, createPublicClient } from "viem";

async function main(){
    // const [deployer] = await viem.getWalletClients();
    // console.log(`deployer address is ${deployer.account.address}`)
    
    const tokenContract = await viem.getContractAt("MyToken", "0xff198373b61fc6132efe421a47637a17c75986c8");
    
    console.log(`voting power for trust is ${await tokenContract.read.getVotes(["0x81D51adbC06827784cE72184Fce6861FFF31D16C"])}`);
    console.log(`voting power for artur is ${await tokenContract.read.getVotes(["0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E"])}`);
    console.log(`voting power for marco is ${await tokenContract.read.getVotes(["0xC35c40Bd72F7528893a259dbf40Fcb266002663e"])}`);
    console.log(`voting power for me is ${await tokenContract.read.getVotes(["0x0936203E154ed749c099fc585770063fAD30BE35"])}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
