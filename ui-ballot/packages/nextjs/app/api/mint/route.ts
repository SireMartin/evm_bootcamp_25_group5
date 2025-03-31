import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseEther } from "viem";
import { foundry } from "viem/chains";

// This is a secret key that should be stored in environment variables
const API_SECRET = process.env.API_SECRET || "your-secret-key";
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;

export async function POST(req: Request) {
  try {
    // Verify API secret from headers
    const apiSecret = req.headers.get("x-api-secret");
    if (apiSecret !== API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();
    const { address, amount } = body;

    if (!address || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: address and amount" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    // Convert amount to wei
    const amountInWei = parseEther(amount.toString());
    
    // Create public client
    const publicClient = createPublicClient({
      chain: foundry,
      transport: http(),
    });

    // Create wallet client
    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: foundry,
      transport: http(),
    });

    // Get contract ABI and address
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Updated contract address
    const contractAbi = [
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" }
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    // Execute the mint transaction
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "mint",
      args: [address, amountInWei],
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
    });
  } catch (error) {
    console.error("Mint API Error:", error);
    return NextResponse.json(
      { error: "Failed to mint tokens" },
      { status: 500 }
    );
  }
} 