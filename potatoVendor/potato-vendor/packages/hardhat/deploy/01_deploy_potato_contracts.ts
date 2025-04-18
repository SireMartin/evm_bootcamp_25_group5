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
  const tokenDeployment = await deploy("Potato", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });
  console.log(`Contract deployed at: ${tokenDeployment.address}`);

  // Debug: Get contract instance
  const PotatoToken = (await ethers.getContractAt("Potato", tokenDeployment.address)) as Potato;
  
  // Debug: Mint initial supply
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  console.log(`Minting ${initialSupply.toString()} tokens to ${deployer}`);
  await PotatoToken.mint(deployer, initialSupply);
  await PotatoToken.mint("0xFe0f545E56c2751ab5beDdC0E99A18ecd9D4ed7E", initialSupply);
  console.log("Minting complete");
  // const minterRole = ethers.id("MINTER_ROLE");
  // console.log(`MINTER_ROLE hash: ${minterRole}`);
  // await PotatoToken.grantRole(minterRole, "0xc8a76224e8C14383E5a57bA3ee0dA9bAA08e26BE");

  console.log("Role granted");

  const vendorDeployment = await deploy("PotatoVendor", {
    from: deployer,
    args: [deployer, tokenDeployment.address],
    log: true,
    autoMine: true,
  });
  console.log(`Contract deployed at: ${vendorDeployment.address}`);
  
  console.log("Deployment complete");
};

export default deployPotatoToken;
deployPotatoToken.tags = ["Potato"]; 