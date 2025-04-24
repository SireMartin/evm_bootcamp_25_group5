import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Potato } from "../typechain-types";
import { ethers } from "hardhat";

const deployPotatoToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Get deployer from private key
  const deployerWallet = await ethers.Wallet.fromEncryptedJson(process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED || "", process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED_PASSWORD || "");
  const deployer = deployerWallet.address;
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
  const initialSupply = hre.ethers.parseEther("10000"); // 1 million tokens
  console.log(`Minting ${initialSupply.toString()} tokens to ${deployer}`);
  
  const tx1 = await PotatoToken.mint(deployer, initialSupply);
  await tx1.wait();
  
  const tx2 = await PotatoToken.mint("0xE270dE780dB6B711Cf089e57AF731Ef761ba1Ea2", initialSupply); //burner wallet hardhat
  await tx2.wait();
  
  const tx3 = await PotatoToken.mint("0x81D51adbC06827784cE72184Fce6861FFF31D16C", initialSupply); //trust
  await tx3.wait();
  
  const tx4 = await PotatoToken.mint("0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E", initialSupply); //arthur moura
  await tx4.wait();
  
  const tx5 = await PotatoToken.mint("0xC35c40Bd72F7528893a259dbf40Fcb266002663e", initialSupply); //marco (binghy)
  await tx5.wait();
  
  console.log("Minting complete");

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