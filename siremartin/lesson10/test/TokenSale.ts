import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const RATIO = 10n;
const PRICE = 5n;
const TEST_BUY_TOKENS = 1n;

async function deployContracts() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount] = await viem.getWalletClients();
  const paymentTokenContract = await viem.deployContract("MyToken"); //msg.sender
  //deployer.deployContract({abi: ... }) via viem rechtstreeks
  const myNftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [RATIO, PRICE, paymentTokenContract.address, myNftContract.address]);
  return { paymentTokenContract, myNftContract, tokenSaleContract, deployer, otherAccount, publicClient };
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
      const { paymentTokenContract, tokenSaleContract, deployer, otherAccount } = await loadFixture(deployContracts);
      const fetchedTotalSupply = await paymentTokenContract.read.totalSupply()
      const fetchedDecimals = await paymentTokenContract.read.decimals()
      const deployerInitialValue = await paymentTokenContract.read.balanceOf([deployer.account.address]);
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
      const {
        publicClient,
        tokenSaleContract,
        otherAccount,
        paymentTokenContract,
      } = await loadFixture(deployContracts);
      const ethBalanceBeforeBuyTx = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const ethBalanceAfterBuyTx = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      const gasAmount = receipt.cumulativeGasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const gasCosts = gasAmount * gasPrice;
      const diff = ethBalanceBeforeBuyTx - ethBalanceAfterBuyTx - gasCosts;
      expect(diff).to.eq(TEST_BUY_TOKENS);
    });

    it("gives the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  })
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    })
    it("burns the correct amount of tokens", async () => {
      const {
        publicClient,
        tokenSaleContract,
        otherAccount,
        paymentTokenContract,
      } = await loadFixture(deployContracts);
      const tx = await tokenSaleContract.write.buyTokens({
        value: TEST_BUY_TOKENS,
        account: otherAccount.account,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      const tokenBalanceAfterBuyTx = await paymentTokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);
      const approveTx = await paymentTokenContract.write.approve(
        [tokenSaleContract.address, tokenBalanceAfterBuyTx],
        {
          account: otherAccount.account,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      const tx2 = await tokenSaleContract.write.burnTokens(
        [tokenBalanceAfterBuyTx],
        {
          account: otherAccount.account,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: tx2 });
      const tokenBalanceAfterBurnTx = await paymentTokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);
      expect(tokenBalanceAfterBurnTx).to.eq(0n);
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