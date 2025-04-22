import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions, createPublicClient, keccak256, encodePacked, hashMessage, recoverMessageAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

// Initialize Viem Clients
const targetNetwork = scaffoldConfig.targetNetworks[0];
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!deployerPrivateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY not set in environment variables. Please set it in packages/nextjs/.env.local");
}

const deployerAccount = privateKeyToAccount(`0x${deployerPrivateKey}`);

const walletClient = createWalletClient({
  account: deployerAccount,
  chain: targetNetwork,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`),
}).extend(publicActions);

const publicClient = createPublicClient({
  chain: targetNetwork,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`),
});

export async function POST(request: Request) {
  console.log("[viem][DEBUG] Locker Open - Deployer account address:", deployerAccount.address);

  try {
    console.log("[viem][DEBUG] Locker Open - Starting execution...");
    const { lockerNumber, v, r, s, signer, messageHash } = await request.json();
    console.log("[viem][DEBUG] Locker Open - Received request:", { lockerNumber, v, r, s, signer, messageHash });

    // Validate parameters
    if (lockerNumber === undefined || v === undefined || !r || !s || !signer || !messageHash) {
      console.error("[viem][ERROR] Locker Open - Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get contract details
    const chainId = targetNetwork.id;
    if (!(chainId in deployedContracts)) {
      console.error(`[viem][ERROR] Locker Open - Contract configuration not found for chainId ${chainId}`);
      return NextResponse.json(
        { error: "Contract configuration not found for network" },
        { status: 500 }
      );
    }
    const vendorContractConfig = deployedContracts[chainId].PotatoVendor;

    if (!vendorContractConfig || !vendorContractConfig.address || !vendorContractConfig.abi) {
      console.error(`[viem][ERROR] Locker Open - PotatoVendor contract details missing for chainId ${chainId}`);
      return NextResponse.json(
        { error: "PotatoVendor contract details missing" },
        { status: 500 }
      );
    }
    const vendorContractAddress = vendorContractConfig.address;
    const vendorContractAbi = vendorContractConfig.abi;
    console.log("[viem][DEBUG] Locker Open - Contract address:", vendorContractAddress);

    // Verify the locker is assigned to the signer using publicClient
    console.log("[viem][DEBUG] Locker Open - Checking locker assignment...");
    const assignedBuyer = await publicClient.readContract({
        address: vendorContractAddress,
        abi: vendorContractAbi,
        functionName: "_lockerToBuyer",
        args: [Number(lockerNumber)]
    });
    console.log("[viem][DEBUG] Locker Open - Assigned buyer:", assignedBuyer);
    console.log("[viem][DEBUG] Locker Open - Signer:", signer);

    if (assignedBuyer.toLowerCase() !== (signer as string).toLowerCase()) {
      console.error("[viem][ERROR] Locker Open - Locker not assigned to this address");
      return NextResponse.json(
        { error: 'Locker not assigned to this address' },
        { status: 400 }
      );
    }

    // Re-create the message hash exactly as the contract does using viem utils
    const packedData = encodePacked(["uint8"], [Number(lockerNumber)]);
    const contractMessageHash = keccak256(packedData);
    const contractEthMessageHash = hashMessage(contractMessageHash);
    console.log("[viem][DEBUG] Locker Open - Contract raw message hash:", contractMessageHash);
    console.log("[viem][DEBUG] Locker Open - Contract prefixed message hash:", contractEthMessageHash);
    console.log("[viem][DEBUG] Locker Open - Received prefixed message hash:", messageHash);

    // Verify the received message hash matches the calculated prefixed hash
    if (contractEthMessageHash.toLowerCase() !== (messageHash as string).toLowerCase()) {
      console.error("[viem][ERROR] Locker Open - Message hash mismatch");
      console.error("[viem][ERROR] Locker Open - Expected:", contractEthMessageHash);
      console.error("[viem][ERROR] Locker Open - Received:", messageHash);
      return NextResponse.json(
        { error: 'Invalid message hash' },
        { status: 400 }
      );
    }

    // Verify the signature using viem
    console.log("[viem][DEBUG] Locker Open - Recovering address from signature...");
    const signature = { r: r as `0x${string}`, s: s as `0x${string}`, v: BigInt(v) };
    const recoveredAddress = await recoverMessageAddress({
      message: { raw: messageHash },
      signature: signature
    });
    console.log("[viem][DEBUG] Locker Open - Recovered address:", recoveredAddress);

    if (recoveredAddress.toLowerCase() !== (signer as string).toLowerCase()) {
      console.error("[viem][ERROR] Locker Open - Signature verification failed");
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Open the locker using the daemon's admin role via walletClient
    console.log("[viem][DEBUG] Locker Open - Opening locker...");
    const txHash = await walletClient.writeContract({
      address: vendorContractAddress,
      abi: vendorContractAbi,
      functionName: "openLocker",
      args: [
        Number(lockerNumber),
        Number(v),
        r as `0x${string}`,
        s as `0x${string}`
      ],
      account: deployerAccount, 
    });
    console.log("[viem][DEBUG] Locker Open - Transaction sent:", txHash);

    // Optional: Wait for transaction confirmation
    // console.log("[viem][DEBUG] Locker Open - Waiting for transaction receipt...");
    // const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    // console.log("[viem][DEBUG] Locker Open - Transaction mined, status:", receipt.status);

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      lockerNumber,
      // status: receipt.status // Uncomment if waiting for receipt
    });

  } catch (error: any) {
    console.error("[viem][ERROR] Locker Open - Error opening locker:", error);
    if (error.shortMessage) {
      console.error("[viem][ERROR] Details:", error.shortMessage);
    }
    if (error.meta) {
      console.error("[viem][ERROR] Meta:", error.meta);
    }
    return NextResponse.json(
      { error: error.shortMessage || 'Failed to open locker' },
      { status: 500 }
    );
  }
} 