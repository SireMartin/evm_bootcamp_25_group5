import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";

// Initialize Viem Public Client
const targetNetwork = scaffoldConfig.targetNetworks[0];
const publicClient = createPublicClient({
  chain: targetNetwork,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`),
});

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

    // Get transaction receipt using viem
    console.log(`[viem][DEBUG] Checking status for hash: ${hash}`);
    const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });
    console.log(`[viem][DEBUG] Receipt found:`, receipt);

    if (!receipt) {
      console.log(`[viem][DEBUG] Status: pending (no receipt)`);
      return NextResponse.json({ status: "pending" });
    }

    // Viem receipt status is a string: 'success' or 'reverted'
    if (receipt.status === "success") {
      console.log(`[viem][DEBUG] Status: success`);
      return NextResponse.json({ status: "success" });
    } else {
      console.log(`[viem][DEBUG] Status: error (reverted)`);
      return NextResponse.json({ status: "error" });
    }
  } catch (error: any) {
    console.error("[viem][ERROR] Error checking transaction status:", error);
    // Log more specific viem error details if available
    if (error.shortMessage) {
      console.error("[viem][ERROR] Details:", error.shortMessage);
    }
    return NextResponse.json(
      { error: error.shortMessage || "Failed to check transaction status" },
      { status: 500 }
    );
  }
} 