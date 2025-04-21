import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { hardhat } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";
// Initialize provider and signer
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!deployerPrivateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY not set in environment variables");
}
const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);

// Contract ABI for permit function
const permitABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function POST(request: Request) {
  try {
    console.log("[DEBUG] Starting permit execution...");
    const body = await request.json();
    console.log("[DEBUG] Request body:", body);

    const { owner, spender, value, deadline, v, r, s, email } = body;
    console.log("[DEBUG] Extracted parameters:", { 
      owner, 
      spender, 
      value: value.toString(), 
      deadline: deadline.toString(),
      v: v.toString(),
      r,
      s,
      email
    });

    // Validate parameters
    if (!owner || !spender || !value || !deadline || !v || !r || !s) {
      console.error("[ERROR] Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the contract address from environment variable
    const contractAddress = deployedContracts[scaffoldConfig.targetNetworks[0].id].Potato.address as `0x${string}`;
    console.log("[DEBUG] Contract address:", contractAddress);
    if (!contractAddress) {
      console.error("[ERROR] POTATO_TOKEN_ADDRESS not found in environment variables");
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    // Get contract instance with signer
    console.log("[DEBUG] Getting contract instance with signer...");
    const contract = new ethers.Contract(contractAddress, permitABI, deployerWallet);
    console.log("[DEBUG] Contract instance created with signer:", deployerWallet.address);

    // Execute permit
    console.log("[DEBUG] Executing permit with parameters:", {
      owner,
      spender,
      value: value,
      deadline: BigInt(deadline).toString(),
      v: parseInt(v),
      r,
      s,
      email
    });

    const tx = await contract.permit(
      owner,
      spender,
      value,
      BigInt(deadline),
      parseInt(v),
      r,
      s,
      email
    );
    console.log("[DEBUG] Permit transaction sent, hash:", tx.hash);

    // Wait for transaction to be mined
    console.log("[DEBUG] Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("[DEBUG] Transaction mined, status:", receipt.status);

    return NextResponse.json({ 
      success: true, 
      transactionHash: tx.hash,
      status: receipt.status 
    });
  } catch (error) {
    console.error("[ERROR] Permit execution failed:", error);
    if (error instanceof Error) {
      console.error("[ERROR] Error details:", {
        message: error.message,
        code: (error as any).code,
        data: (error as any).data
      });
    }
    return NextResponse.json(
      { error: "Failed to execute permit" },
      { status: 500 }
    );
  }
} 