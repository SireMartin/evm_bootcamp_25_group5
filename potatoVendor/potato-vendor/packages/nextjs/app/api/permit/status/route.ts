import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { hardhat } from "viem/chains";

// Initialize provider
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json(
        { error: "Transaction hash is required" },
        { status: 400 }
      );
    }

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(hash);

    if (!receipt) {
      return NextResponse.json({ status: "pending" });
    }

    if (receipt.status === 1) {
      return NextResponse.json({ status: "success" });
    } else {
      return NextResponse.json({ status: "error" });
    }
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return NextResponse.json(
      { error: "Failed to check transaction status" },
      { status: 500 }
    );
  }
} 