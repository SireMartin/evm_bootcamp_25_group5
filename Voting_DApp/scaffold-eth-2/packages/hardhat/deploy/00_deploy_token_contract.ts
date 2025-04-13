// First run: yarn add @nomicfoundation/hardhat-viem --dev
import { Contract } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseEther } from "viem";

// const MINT_VALUE = parseEther("5");

// Hardhat Chain
// const acc1 =  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
// const acc2 =  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
// const acc3 =  "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
// const acc4 =  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

const deployTokenContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    // Creating publicClient and WalletClient  
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\nDeploying Token contract...");
    const hash = await deploy("Shebang", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });
    console.log("Transaction hash:", hash);
    const tokenContract = await hre.ethers.getContract<Contract>("Shebang", deployer);
    console.log("Token name:", await tokenContract.name());
    console.log(`Token contract address: ${await tokenContract.getAddress()}`)
    console.log(`Deployer address: ${deployer}`)

    // const mintTxAcc1 = await tokenContract.mint(acc1, MINT_VALUE);
    // await mintTxAcc1.wait();
    // const mintTxAcc2 = await tokenContract.mint(acc2, MINT_VALUE);
    // await mintTxAcc2.wait();
    // const mintTxAcc3 = await tokenContract.mint(acc3, MINT_VALUE);
    // await mintTxAcc3.wait();
    // const mintTxAcc4 = await tokenContract.mint(acc4, MINT_VALUE);
    // await mintTxAcc4.wait();
//    const mintTxAcc5 = await tokenContract.mint("0xE270dE780dB6B711Cf089e57AF731Ef761ba1Ea2", MINT_VALUE);
//    await mintTxAcc5.wait();
}

export default deployTokenContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployTokenContract.tags = ["TokenContract"];