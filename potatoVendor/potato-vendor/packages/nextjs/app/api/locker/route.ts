import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { privateKeyToAccount } from "viem/accounts";
import scaffoldConfig from "~~/scaffold.config";

// This should be moved to an environment variable in production
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!deployerPrivateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY not set in environment variables");
}

export async function POST(request: Request) {
  try {
    const { lockerNumber, signature } = await request.json();
    const { v, r, s } = signature;

    const account = privateKeyToAccount(deployerPrivateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: hardhat,
      transport: http(),
    });

    console.log("Attempting to open locker with:");
    console.log("lockerNumber:", lockerNumber, "type:", typeof lockerNumber);
    console.log("v:", v, "type:", typeof v);
    console.log("r:", r, "length:", r.length);
    console.log("s:", s, "length:", s.length);

    const tx = await walletClient.writeContract({
      address: deployedContracts[scaffoldConfig.targetNetworks[0].id].PotatoVendor.address,
      abi: deployedContracts[scaffoldConfig.targetNetworks[0].id].PotatoVendor.abi,
      functionName: "openLocker",
      args: [Number(lockerNumber), Number(v), r as `0x${string}`, s as `0x${string}`],
    });

    console.log("Transaction successful:", tx);

    return NextResponse.json({ 
      success: true, 
      transactionHash: tx 
    });
  } catch (error) {
    console.error("Error opening locker:", error);
    return NextResponse.json(
      { success: false, error: "Failed to open locker" },
      { status: 500 }
    );
  }
} 