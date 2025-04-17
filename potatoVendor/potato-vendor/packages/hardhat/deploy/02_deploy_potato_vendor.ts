import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployPotatoToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Debug: Get deployer account
  const { deployer } = await hre.getNamedAccounts();
  console.log(`Deployer: ${deployer}`);
  const { deploy } = hre.deployments;

  const deployment = await deploy("PotatoVendor", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
  console.log(`Contract deployed at: ${deployment.address}`);
  console.log("Deployment complete");
};

export default deployPotatoToken;
deployPotatoToken.tags = ["Potato"]; 