import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployHelloWorld: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("HelloWorld", {
    from: deployer,
    log: true,
    autoMine: true,
  });
};

export default deployHelloWorld;

deployHelloWorld.tags = ["HelloWorld"];