"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { parseEther } from "viem";
import { Address, AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { ethers } from "ethers";

// ERC20 Permit type data
const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

type TransactionStatus = "idle" | "pending" | "success" | "error";

export default function PermitPage() {
  const { address } = useAccount();
  const [spender, setSpender] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");
  const [deadline, setDeadline] = useState<number>(0);
  const [nonce, setNonce] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { signTypedDataAsync } = useSignTypedData();
  const { data: currentNonce, isLoading: isNonceLoading } = useScaffoldReadContract({
    contractName: "Potato",
    functionName: "nonces",
    args: [address],
  });

  const checkTransactionStatus = async (hash: string) => {
    try {
      const response = await fetch(`/api/permit/status?hash=${hash}`);
      if (!response.ok) {
        throw new Error("Failed to check transaction status");
      }
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("Error checking transaction status:", error);
      return "error";
    }
  };

  const handlePermit = async () => {
    try {
      console.log("[DEBUG] Starting permit process...");
      setIsLoading(true);
      setTransactionStatus("pending");
      setErrorMessage("");
      
      if (!address) {
        console.error("[ERROR] No connected wallet address");
        return;
      }
      if (!spender) {
        console.error("[ERROR] No spender address provided");
        return;
      }
      if (isNonceLoading) {
        console.error("[ERROR] Nonce is still loading");
        return;
      }
      if (currentNonce === undefined) {
        console.error("[ERROR] Current nonce is undefined");
        return;
      }

      console.log("[DEBUG] Addresses and nonce:", {
        owner: address,
        spender: spender,
        connected: address,
        currentNonce: currentNonce?.toString()
      });

      // Validate addresses
      if (!ethers.isAddress(address)) {
        console.error("[ERROR] Invalid owner address:", address);
        return;
      }
      if (!ethers.isAddress(spender)) {
        console.error("[ERROR] Invalid spender address:", spender);
        return;
      }

      // Get current timestamp and add 1 hour
      const currentTime = Math.floor(Date.now() / 1000);
      const newDeadline = currentTime + 3600; // 1 hour from now
      setDeadline(newDeadline);
      setNonce(currentNonce);
      console.log("[DEBUG] Set deadline and nonce:", { 
        newDeadline, 
        currentNonce: currentNonce.toString() 
      });

      // Get the contract address from deployedContracts
      const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
      console.log("[DEBUG] Using contract address:", contractAddress);

      // Prepare permit data
      const domain = {
        name: "Potato",
        version: "1",
        chainId: 31337, // Hardhat network ID
        verifyingContract: contractAddress,
      };
      console.log("[DEBUG] Domain data:", domain);

      const message = {
        owner: address,
        spender,
        value: parseEther(amount),
        nonce: currentNonce,
        deadline: BigInt(newDeadline),
      };
      console.log("[DEBUG] Permit message:", {
        ...message,
        value: message.value.toString(),
        nonce: message.nonce.toString(),
        deadline: message.deadline.toString()
      });

      // Sign the permit
      console.log("[DEBUG] Requesting signature...");
      const signature = await signTypedDataAsync({
        domain,
        types: PERMIT_TYPES,
        primaryType: "Permit",
        message,
      });
      console.log("[DEBUG] Received signature:", signature);

      // Split signature into v, r, s
      const v = parseInt(signature.slice(130, 132), 16);
      const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
      const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
      console.log("[DEBUG] Split signature:", { v, r, s });

      // Send to backend API
      console.log("[DEBUG] Sending permit to backend...");
      const response = await fetch("/api/permit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: address,
          spender,
          value: parseEther(amount).toString(),
          deadline: newDeadline.toString(),
          v,
          r,
          s,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[ERROR] Backend error:", errorData);
        throw new Error("Failed to execute permit");
      }

      const result = await response.json();
      console.log("[DEBUG] Backend response:", result);
      setTransactionHash(result.transactionHash);
      
      // Check transaction status periodically
      console.log("[DEBUG] Starting transaction status checks...");
      const checkStatus = async () => {
        const status = await checkTransactionStatus(result.transactionHash);
        console.log("[DEBUG] Transaction status:", status);
        setTransactionStatus(status);
        if (status === "pending") {
          setTimeout(checkStatus, 5000); // Check again in 5 seconds
        }
      };
      
      checkStatus();
    } catch (error) {
      console.error("[ERROR] Permit process failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      setTransactionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Potato Token Permit</span>
        </h1>
        
        <div className="mt-8 max-w-md mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Spender Address</span>
            </label>
            <AddressInput
              value={spender}
              onChange={setSpender}
              placeholder="Enter spender address"
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <EtherInput
              value={amount}
              onChange={setAmount}
              placeholder="Enter amount"
            />
          </div>

          <div className="mt-6">
            <p className="text-lg">
              Your Address: <Address address={address} />
            </p>
            <p className="text-lg">
              Current Nonce: {currentNonce?.toString()}
            </p>
            <p className="text-lg">
              Deadline: {new Date(deadline * 1000).toLocaleString()}
            </p>
          </div>

          <button
            className="btn btn-primary w-full mt-6"
            onClick={handlePermit}
            disabled={!address || !spender || !amount || isLoading}
          >
            {isLoading ? "Processing..." : "Execute Permit"}
          </button>

          {transactionHash && (
            <div className="mt-4">
              <p className="text-lg">
                Transaction Hash:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  {transactionHash}
                </a>
              </p>
              <p className="text-lg">
                Status:{" "}
                <span
                  className={`font-bold ${
                    transactionStatus === "success"
                      ? "text-success"
                      : transactionStatus === "error"
                      ? "text-error"
                      : "text-warning"
                  }`}
                >
                  {transactionStatus}
                </span>
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4">
              <p className="text-error">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 