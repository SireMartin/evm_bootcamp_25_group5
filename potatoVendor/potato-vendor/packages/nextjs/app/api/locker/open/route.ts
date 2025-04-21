import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const { lockerNumber, v, r, s, signer, messageHash } = await request.json();
    console.log("Received request:", { lockerNumber, v, r, s, signer, messageHash });

    // Create provider and wallet with daemon's private key
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

    // Load contract ABI and address
    const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
    const abi = [
      'function openLocker(uint8 lockerNumber, uint8 v, bytes32 r, bytes32 s)',
      'function _lockerToBuyer(uint8) view returns (address)',
    ];

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

    // Verify the signature matches the contract's format
    const recoveredAddress = ethers.recoverAddress(
      messageHash,
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