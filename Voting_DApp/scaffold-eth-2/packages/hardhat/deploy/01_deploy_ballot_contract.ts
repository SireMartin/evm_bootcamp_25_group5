import { Contract } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { toHex } from "viem";

const proposalColl = ["Biaggi", "Stoner", "Rossi", "Marquez"];

const deployTokenContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    try {
        const tokenContract = await hre.ethers.getContract<Contract>("Shebang", deployer);
        console.log(`TokenContract fetched at ${await tokenContract.getAddress()}`);
        console.log(`Deployer address: ${deployer}`);

        const proposals = proposalColl.map((prop) => toHex(prop, { size: 32 }));
        console.log("Proposals:", proposals);

        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log("Block Number:", blockNumber);

        console.log("\nDeploying Ballot contract...");
        const hash = await deploy("TokenizedBallot", {
            from: deployer,
            args: [
                proposals,
                await tokenContract.getAddress(),
                blockNumber
            ],
            log: true,
            autoMine: true
        });
        console.log("Transaction hash:", hash);
        const ballotContract = await hre.ethers.getContract<Contract>("TokenizedBallot", deployer);
        console.log(`TokenizedBallot contract deployed at ${await ballotContract.getAddress()}`);
        console.log("TargetBlockNumber:", await ballotContract.targetBlockNumber());
    } catch (error) {
        console.error("Deployment failed:", error);
    }
};

export default deployTokenContract;

deployTokenContract.tags = ["TokenizedBallot"];

