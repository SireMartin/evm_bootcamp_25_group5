import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

// Initialize Viem Wallet Client
const targetNetwork = scaffoldConfig.targetNetworks[0];
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;

console.log(`pk = ${deployerPrivateKey}`)

if (!deployerPrivateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY not set in environment variables. Please set it in packages/nextjs/.env.local");
}
if (!rpcUrl) {
  throw new Error("RPC_URL not set in environment variables. Please set it in packages/nextjs/.env.local");
}

const deployerAccount = privateKeyToAccount(`0x${deployerPrivateKey}`);

const walletClient = createWalletClient({
  account: deployerAccount,
  chain: targetNetwork,
  transport: http(rpcUrl),
}).extend(publicActions);

export async function POST(request: Request) {
  console.log("[viem][DEBUG] Deployer account address:", deployerAccount.address);

  try {
    console.log("[viem][DEBUG] Starting permit execution...");
    const body = await request.json();
    console.log("[viem][DEBUG] Request body:", body);

    const { owner, spender, value, deadline, v, r, s, email } = body;
    console.log("[viem][DEBUG] Extracted parameters:", { 
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
    if (!owner || !spender || !value || !deadline || v === undefined || !r || !s) {
      console.error("[viem][ERROR] Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get contract details
    const chainId = targetNetwork.id;
    // Explicitly check if deployedContracts has the key chainId
    if (!(chainId in deployedContracts)) {
      console.error(`[viem][ERROR] Contract configuration not found for chainId ${chainId}`);
      return NextResponse.json(
        { error: "Contract configuration not found for network" },
        { status: 500 }
      );
    }
    const vendorContractConfig = deployedContracts[chainId].PotatoVendor;

    if (!vendorContractConfig || !vendorContractConfig.address || !vendorContractConfig.abi) {
      console.error(`[viem][ERROR] PotatoVendor contract details missing for chainId ${chainId}`);
      return NextResponse.json(
        { error: "PotatoVendor contract details missing" },
        { status: 500 }
      );
    }
    const vendorContractAddress = vendorContractConfig.address;
    const vendorContractAbi = vendorContractConfig.abi;
    console.log("[viem][DEBUG] Contract address:", vendorContractAddress);

    // Execute permit using viem's writeContract
    console.log("[viem][DEBUG] Executing permit with parameters:", {
      owner,
      spender,
      value: BigInt(value).toString(), // Ensure value is bigint
      deadline: BigInt(deadline).toString(), // Ensure deadline is bigint
      v: Number(v), // Ensure v is number
      r,
      s,
      email
    });

    const txHash = await walletClient.writeContract({
      address: vendorContractAddress,
      abi: vendorContractAbi,
      functionName: "permit",
      args: [
        owner as `0x${string}`,
        spender as `0x${string}`,
        BigInt(value),
        BigInt(deadline),
        Number(v),
        r as `0x${string}`,
        s as `0x${string}`,
        email
      ],
      account: deployerAccount, // Ensure account is specified
    });

    console.log("[viem][DEBUG] Permit transaction sent, hash:", txHash);

    // Optional: Wait for transaction confirmation
    // console.log("[viem][DEBUG] Waiting for transaction receipt...");
    // const receipt = await walletClient.waitForTransactionReceipt({ hash: txHash });
    // console.log("[viem][DEBUG] Transaction mined, status:", receipt.status);

    return NextResponse.json({ 
      success: true, 
      transactionHash: txHash,
      // status: receipt.status // Uncomment if waiting for receipt
    });

  } catch (error: any) {
    console.error("[viem][ERROR] Permit execution failed:", error);
    // Log more specific viem error details if available
    if (error.shortMessage) {
      console.error("[viem][ERROR] Details:", error.shortMessage);
    }
    if (error.meta) {
      console.error("[viem][ERROR] Meta:", error.meta);
    }
    return NextResponse.json(
      { error: error.shortMessage || "Failed to execute permit" },
      { status: 500 }
    );
  }
} 