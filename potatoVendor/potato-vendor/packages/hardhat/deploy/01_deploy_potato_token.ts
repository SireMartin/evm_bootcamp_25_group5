import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Potato } from "../typechain-types";
import { ethers } from "hardhat";

const deployPotatoToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Debug: Get deployer account
  const { deployer } = await hre.getNamedAccounts();
  console.log(`Deployer: ${deployer}`);
  const { deploy } = hre.deployments;

  // Debug: Deploy contract
  const deployment = await deploy("Potato", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });
  console.log(`Contract deployed at: ${deployment.address}`);

  // Debug: Get contract instance
  const PotatoToken = (await ethers.getContractAt("Potato", deployment.address)) as Potato;
  
  // Debug: Mint initial supply
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  console.log(`Minting ${initialSupply.toString()} tokens to ${deployer}`);
  await PotatoToken.mint(deployer, initialSupply);
  await PotatoToken.mint("0xE270dE780dB6B711Cf089e57AF731Ef761ba1Ea2", initialSupply);
  console.log("Minting complete");

  // Debug: Grant MINTER_ROLE
  const minterRole = ethers.id("MINTER_ROLE");
  console.log(`MINTER_ROLE hash: ${minterRole}`);
  await PotatoToken.grantRole(minterRole, "0xE270dE780dB6B711Cf089e57AF731Ef761ba1Ea2");
  console.log("Role granted");
  
  console.log("Deployment complete");
};

export default deployPotatoToken;
deployPotatoToken.tags = ["Potato"]; 