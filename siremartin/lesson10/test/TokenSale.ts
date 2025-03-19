import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const RATIO = 10n;
const PRICE = 5n;

async function deployContracts(){
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount] = await viem.getWalletClients();
  const myTokenContract = await viem.deployContract("MyToken"); //msg.sender
  //deployer.deployContract({abi: ... }) via viem rechtstreeks
  const myNftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [RATIO, PRICE, myTokenContract.address, myNftContract.address]);
  return { myTokenContract, myNftContract, tokenSaleContract, deployer, otherAccount };
}

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContracts);
      const fetchedRatio = await tokenSaleContract.read.ratio();
      expect(fetchedRatio).to.eq(RATIO);
    })
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContracts);
      const fetchedPrice = await tokenSaleContract.read.price();
      expect(fetchedPrice).to.eq(PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { myTokenContract, tokenSaleContract, deployer, otherAccount } = await loadFixture(deployContracts);
      const fetchedTotalSupply = await myTokenContract.read.totalSupply()
      const fetchedDecimals = await myTokenContract.read.decimals()
      const deployerInitialValue = await myTokenContract.read.balanceOf([deployer.account.address]);
      expect(fetchedTotalSupply).to.eq(10n * 10n ** BigInt(fetchedDecimals));
      /*await deployer.writeContract({
        address: tokenSaleContract.address,
        abi: tokenSaleContract.abi,
        functionName: "transferTokens",
        args: [ otherAccount.account.address, 10n ** BigInt(fetchedDecimals)]
      });
      const deployerFinalValue = await myTokenContract.read.balanceOf([deployer.account.address]);
      expect(BigInt(deployerInitialValue)).to.greaterThan(BigInt(deployerFinalValue));*/
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user buys an ERC20 from the Token contract", async () => {  
    it("charges the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("burns the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    })
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});