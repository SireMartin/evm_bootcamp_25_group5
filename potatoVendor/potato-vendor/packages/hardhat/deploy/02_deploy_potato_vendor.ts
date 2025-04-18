import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract } from "ethers";

const deployPotatoVendor: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  // Get deployer account
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  try {

    const tokenContract = await hre.ethers.getContract<Contract>("Potato", deployer);
    console.log(`PotatoToken contract fetched at ${await tokenContract.getAddress()}`);

    const deploymentTx = await deploy("PotatoVendor", {
      from: deployer,
      args: [
        await tokenContract.getAddress(),
        deployer
      ],
      log: true,
      autoMine: true,
    });
    console.log(`PotatoVendor contract deployed at: ${deploymentTx.address}.`);
    console.log("Contract deployment transaction hash:", deploymentTx);
    console.log(`Deployer: ${deployer}`);
    console.log("Deployment complete.");

  } catch (error) {

    console.error("Deployment failed:", error);

  }

};

export default deployPotatoVendor;

deployPotatoVendor.tags = ["Potato"];
