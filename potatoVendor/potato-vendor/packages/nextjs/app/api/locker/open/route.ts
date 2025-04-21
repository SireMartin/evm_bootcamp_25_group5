import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import deployedContracts from "~~/contracts/deployedContracts";

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!deployerPrivateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY not set in environment variables");
}

export async function POST(request: Request) {
  try {
    const { lockerNumber, v, r, s, signer, messageHash } = await request.json();
    console.log("Received request:", { lockerNumber, v, r, s, signer, messageHash });

    // Create provider and wallet with daemon's private key
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const wallet = new ethers.Wallet(deployerPrivateKey as `0x${string}`, provider);

    // Load contract ABI and address
    const contractAddress = deployedContracts[31337].PotatoVendor.address;
    const abi = deployedContracts[31337].PotatoVendor.abi;

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // Verify the locker is assigned to the signer
    const assignedBuyer = await contract._lockerToBuyer(lockerNumber);
    console.log("Assigned buyer:", assignedBuyer);
    console.log("Signer:", signer);
    
    if (assignedBuyer.toLowerCase() !== signer.toLowerCase()) {
      console.error("Locker not assigned to this address");
      return NextResponse.json(
        { error: 'Locker not assigned to this address' },
        { status: 400 }
      );
    }

    // Create the message hash exactly as the contract does
    const contractMessageHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [lockerNumber]));
    const contractEthMessageHash = ethers.hashMessage(ethers.getBytes(contractMessageHash));
    console.log("Contract message hash:", contractMessageHash);
    console.log("Contract Ethereum signed message hash:", contractEthMessageHash);
    console.log("Received message hash:", messageHash);

    // Verify the message hashes match
    if (contractEthMessageHash.toLowerCase() !== messageHash.toLowerCase()) {
      console.error("Message hash mismatch");
      console.error("Expected:", contractEthMessageHash);
      console.error("Received:", messageHash);
      return NextResponse.json(
        { error: 'Invalid message hash' },
        { status: 400 }
      );
    }

    // Verify the signature matches the contract's format
    const recoveredAddress = ethers.recoverAddress(
      contractEthMessageHash,
      { r, s, v }
    );
    console.log("Recovered address:", recoveredAddress);
    
    if (recoveredAddress.toLowerCase() !== signer.toLowerCase()) {
      console.error("Signature verification failed");
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Open the locker using the daemon's admin role
    console.log("Opening locker...");
    const tx = await contract.openLocker(lockerNumber, v, r, s);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.hash);

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      lockerNumber,
    });
  } catch (error) {
    console.error('Error opening locker:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to open locker' },
      { status: 500 }
    );
  }
} 