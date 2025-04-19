import { expect } from "chai";
import { ethers } from "hardhat";
import { PotatoVendor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EventLog } from "ethers";

describe("PotatoVendor", function () {
  let potatoVendor: PotatoVendor;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let token: any;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    // Deploy mock USDC token
    const Token = await ethers.getContractFactory("Potato");
    token = await Token.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    // Deploy PotatoVendor
    const PotatoVendor = await ethers.getContractFactory("PotatoVendor");
    potatoVendor = await PotatoVendor.deploy(owner.address, await token.getAddress());
    await potatoVendor.waitForDeployment();

    // Mint some tokens to the buyer
    await token.mint(buyer.address, ethers.parseEther("1000"));
  });

  describe("reserveLocker", function () {
    it("should assign locker to buyer when lockers are available", async function () {
      const tx = await potatoVendor.reserveLocker(buyer.address);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0] as EventLog;
      const lockerNumber = Number(event.args[1]);
      expect(lockerNumber).to.be.lessThan(256);
      expect(await potatoVendor._lockerToBuyer(lockerNumber)).to.equal(buyer.address);
    });

    it("should assign consecutive lockers when making multiple reservations", async function () {
      const usedLockers = new Set<number>();
      
      // Reserve 10 lockers and check they're all unique
      for (let i = 0; i < 10; i++) {
        const tx = await potatoVendor.reserveLocker(buyer.address);
        const receipt = await tx.wait();
        if (!receipt) throw new Error("Transaction receipt is null");
        const event = receipt.logs[0] as EventLog;
        const lockerNumber = Number(event.args[1]);
        expect(usedLockers.has(lockerNumber)).to.be.false;
        usedLockers.add(lockerNumber);
        expect(await potatoVendor._lockerToBuyer(lockerNumber)).to.equal(buyer.address);
      }
    });

    it("should revert when all lockers are full", async function () {
      // Fill all 256 lockers
      for (let i = 0; i < 256; i++) {
        await potatoVendor.reserveLocker(buyer.address);
      }

      // Attempt to reserve one more locker
      await expect(potatoVendor.reserveLocker(buyer.address))
        .to.be.reverted;
    });

    it("should assign next available locker when a locker is already taken", async function () {
      // Reserve a specific locker
      const tx1 = await potatoVendor.reserveLocker(buyer.address);
      const receipt1 = await tx1.wait();
      if (!receipt1) throw new Error("Transaction receipt is null");
      const event1 = receipt1.logs[0] as EventLog;
      const firstLocker = Number(event1.args[1]);
      
      // Reserve another locker
      const tx2 = await potatoVendor.reserveLocker(buyer.address);
      const receipt2 = await tx2.wait();
      if (!receipt2) throw new Error("Transaction receipt is null");
      const event2 = receipt2.logs[0] as EventLog;
      const secondLocker = Number(event2.args[1]);
      
      // Verify they're different
      expect(firstLocker).to.not.equal(secondLocker);
      
      // Verify both are assigned to the buyer
      expect(await potatoVendor._lockerToBuyer(firstLocker)).to.equal(buyer.address);
      expect(await potatoVendor._lockerToBuyer(secondLocker)).to.equal(buyer.address);
    });

    it("should emit LockerAssigned event when reserving a locker", async function () {
      await expect(potatoVendor.reserveLocker(buyer.address))
        .to.emit(potatoVendor, "LockerAssigned")
        .withArgs(buyer.address, anyValue);
    });

    it("should update _lastLockerNumber when reserving a locker", async function () {
      const tx = await potatoVendor.reserveLocker(buyer.address);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0] as EventLog;
      const lockerNumber = Number(event.args[1]);
      expect(await potatoVendor._lastLockerNumber()).to.equal(lockerNumber);
    });
  });

  describe("openLocker", function () {
    it("should open locker with valid signature", async function () {
      // Reserve a locker first
      const tx = await potatoVendor.reserveLocker(buyer.address);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0] as EventLog;
      const lockerNumber = Number(event.args[1]);

      // Create the message hash exactly as the contract does
      const messageHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [lockerNumber]));
      const signature = await buyer.signMessage(ethers.getBytes(messageHash));
      const sig = ethers.Signature.from(signature);

      // Open the locker
      await expect(potatoVendor.openLocker(lockerNumber, sig.v, sig.r, sig.s))
        .to.emit(potatoVendor, "LockerOpened")
        .withArgs(buyer.address, lockerNumber);

      // Verify locker is cleared
      expect(await potatoVendor._lockerToBuyer(lockerNumber)).to.equal(ethers.ZeroAddress);
    });

    it("should revert when opening unassigned locker", async function () {
      const lockerNumber = 1;
      const messageHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [lockerNumber]));
      const signature = await buyer.signMessage(ethers.getBytes(messageHash));
      const sig = ethers.Signature.from(signature);

      await expect(potatoVendor.openLocker(lockerNumber, sig.v, sig.r, sig.s))
        .to.be.revertedWith("Locker not assigned");
    });

    it("should revert when signature is invalid", async function () {
      // Reserve a locker
      const tx = await potatoVendor.reserveLocker(buyer.address);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0] as EventLog;
      const lockerNumber = Number(event.args[1]);

      // Sign a different locker number
      const wrongLockerNumber = lockerNumber + 1;
      const messageHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [wrongLockerNumber]));
      const signature = await buyer.signMessage(ethers.getBytes(messageHash));
      const sig = ethers.Signature.from(signature);

      await expect(potatoVendor.openLocker(lockerNumber, sig.v, sig.r, sig.s))
        .to.be.revertedWith("Invalid signature");
    });

    it("should revert when signer is not the buyer", async function () {
      // Reserve a locker
      const tx = await potatoVendor.reserveLocker(buyer.address);
      const receipt = await tx.wait();
      if (!receipt) throw new Error("Transaction receipt is null");
      const event = receipt.logs[0] as EventLog;
      const lockerNumber = Number(event.args[1]);

      // Sign with a different account
      const [otherSigner] = await ethers.getSigners();
      const messageHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [lockerNumber]));
      const signature = await otherSigner.signMessage(ethers.getBytes(messageHash));
      const sig = ethers.Signature.from(signature);

      await expect(potatoVendor.openLocker(lockerNumber, sig.v, sig.r, sig.s))
        .to.be.revertedWith("Invalid signature");
    });
  });
});

// Helper function to match any value in event assertions
function anyValue() {
  return true;
} 