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

    //adding marco as minter
    const minterRole = await tokenContract.read.MINTER_ROLE();
    const hasMinterRoleBefore = await tokenContract.read.hasRole([minterRole, "0xC35c40Bd72F7528893a259dbf40Fcb266002663e"]);
    console.log(`has minter role ? ${hasMinterRoleBefore}`) 
    await tokenContract.write.grantRole([minterRole, "0xC35c40Bd72F7528893a259dbf40Fcb266002663e"])
    const hasMinterRoleAfter = await tokenContract.read.hasRole([minterRole, "0xC35c40Bd72F7528893a259dbf40Fcb266002663e"]);
    console.log(`has minter role ? ${hasMinterRoleAfter}`)
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})
