import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Potato } from "../typechain-types";
import { ethers } from "hardhat";

const deployPotatoToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  
  // Get deployer account
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  try {
    
    // Deploy contract
    const deploymentTx = await deploy("Potato", {
      from: deployer,
      args: [deployer, deployer],
      log: true,
      autoMine: true,
    });
    console.log(`PotatoToken contract deployed at: ${deploymentTx.address}`);
    // console.log("Contract deployment transaction hash:", deploymentTx);
    console.log(`Deployer: ${deployer}`);

    // Get contract instance
    const PotatoToken = (await ethers.getContractAt("Potato", deploymentTx.address)) as Potato;
  
    // Mint initial supply
    const initialSupply = hre.ethers.parseEther("1000000");                           // 1 million tokens
    console.log(`Minting ${initialSupply.toString()} tokens to ${deployer}...`);
    const mintTx = await PotatoToken.mint(deployer, initialSupply);
    // console.log("Minting transaction hash:", mintTx);
    // await PotatoToken.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", initialSupply);
    console.log("Minting complete!");

    // Grant MINTER_ROLE
    const minterRole = ethers.id("MINTER_ROLE");
    console.log(`MINTER_ROLE hash: ${minterRole}`);
    const mintingRoleTx = await PotatoToken.grantRole(minterRole, deployer);
    // console.log("Minting transaction hash:", mintingRoleTx);
    // await PotatoToken.grantRole(minterRole, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log("Role granted!");
  
    console.log("Deployment complete.");

  } catch (error) {

    console.error("Deployment failed:", error);

  }

};

export default deployPotatoToken;

deployPotatoToken.tags = ["Potato"];
