import { viem } from "hardhat";
import { parseEther, formatEther, toHex } from "viem";

const MINT_VALUE = parseEther("5");
const acc1 = "0x81D51adbC06827784cE72184Fce6861FFF31D16C";      //trust
const acc2 = "0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E";      //artur
const acc3 = "0xC35c40Bd72F7528893a259dbf40Fcb266002663e";      //marco
const acc4 = "0x0936203E154ed749c099fc585770063fAD30BE35";      //me
const proposalColl = ["Argentina", "Brazil"];

async function main() {

    // Creating publicClient and WalletClient  
    const publicClient = await viem.getPublicClient();
    const [deployer] = await viem.getWalletClients();
    const tokenContract = await viem.getContractAt("MyToken", "0xFF198373b61Fc6132EFe421A47637A17C75986C8");
    
    // Deploy the TokenizedBallot contract with a block reference after the self delegations
    const ballotContract = await viem.deployContract("TokenizedBallot", 
        [
            proposalColl.map((prop) => toHex(prop, { size: 32 })),
            tokenContract.address,
            7962771n // We provide the subsequent block number of the last self delegation call on the token contract
    ]);
    console.log(`TokenizedBallot contract deployed at ${ballotContract.address}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
