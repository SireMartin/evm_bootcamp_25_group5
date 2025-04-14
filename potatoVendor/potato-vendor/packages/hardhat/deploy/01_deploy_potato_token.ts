import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployPotatoToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Potato", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const PotatoToken = await hre.ethers.getContract("Potato", deployer);
  
  // Mint initial supply to deployer
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  await PotatoToken.mint(deployer, initialSupply);
  
  console.log("PotatoToken deployed and initial supply minted");
};

export default deployPotatoToken;
deployPotatoToken.tags = ["Potato"]; 