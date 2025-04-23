"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useSignMessage } from "wagmi";
import { useWalletClient, usePublicClient } from "wagmi";
import type { SignableMessage } from "viem";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { keccak256, encodePacked } from "viem";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ethers } from "ethers";

const OpenLockerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lockerNumberInput, setLockerNumberInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: potatoVendorContract } = useScaffoldContract({
    contractName: "PotatoVendor",
    walletClient,
  });

  const openLocker = async (args: [number, number, `0x${string}`, `0x${string}`]) => {
    if (!potatoVendorContract) throw new Error("Contract not initialized");
    if (!publicClient) throw new Error("Public client not initialized");
    try {
      console.log("Opening locker with args:", args);
      console.log("Contract address:", potatoVendorContract.address);
      console.log("Sender address:", connectedAddress);
      
      // Create message hash exactly as the contract does
      const rawLockerHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [args[0]]));
      console.log("Raw locker hash:", rawLockerHash);
      // const prefixedLockerHash = ethers.hashMessage(ethers.getBytes(rawLockerHash));
      // console.log("Prefixed locker hash:", prefixedLockerHash);

      // Call the daemon's API to open the locker
      const response = await fetch('/api/locker/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lockerNumber: args[0],
          v: args[1],
          r: args[2],
          s: args[3],
          signer: connectedAddress,
          messageHash: rawLockerHash,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        throw new Error(error.message || 'Failed to open locker');
      }

      const result = await response.json();
      console.log("Locker opened successfully:", result);
      return result;
    } catch (error) {
      console.error("Contract call error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Locker not assigned")) {
          throw new Error("This locker is not assigned to your address");
        } else if (error.message.includes("Invalid signature")) {
          throw new Error("Invalid signature. Please try again.");
        } else if (error.message.includes("Internal JSON-RPC error")) {
          throw new Error("Signature verification failed. Please ensure you're using the correct locker number and try again.");
        } else {
          throw new Error(`Failed to open locker: ${error.message}`);
        }
      }
      throw error;
    }
  };

  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: async (data: `0x${string}`, variables: { message: SignableMessage }) => {
        try {
          setIsLoading(true);
          setError(null);
          console.log("Signature:", data);
          
          // Split signature into v, r, s components
          const sig = data.slice(2);
          const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
          const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
          const v = parseInt(sig.slice(128, 130), 16);
          
          console.log("Signature components:", { v, r, s });

          const lockerNumber = parseInt(lockerNumberInput, 10);
          if (isNaN(lockerNumber) || lockerNumber < 0 || lockerNumber > 255) {
            throw new Error("Invalid locker number. Must be between 0 and 255.");
          }

          // Call the contract
          notification.info("Opening locker...");
          const receipt = await openLocker([lockerNumber, v, r, s]);
          notification.success("Locker opened successfully!");
        } catch (error) {
          console.error("Failed to open locker:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to open locker";
          setError(errorMessage);
          notification.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Signature error:", error);
        setError("Failed to sign message. Please try again.");
        notification.error("Failed to sign message. Please try again.");
      }
    },
  });

  const handleSignMessage = () => {
    const lockerNumber = parseInt(lockerNumberInput, 10);
    if (isNaN(lockerNumber) || lockerNumber < 0 || lockerNumber > 255) {
      notification.error("Please enter a valid locker number (0-255).");
      return;
    }

    // Create the raw message hash exactly as the contract does
    const rawLockerHash = ethers.keccak256(ethers.solidityPacked(["uint8"], [lockerNumber]));
    console.log("Raw locker hash (to be signed):", rawLockerHash);
    
    // Sign the raw hash bytes - wagmi/viem will add the EIP-191 prefix
    signMessage({ message: { raw: ethers.getBytes(rawLockerHash) } });
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Open Locker</span>
          </h1>
          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 flex-col">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          )}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <div className="form-control w-full max-w-xs mb-4">
                <label className="label">
                  <span className="label-text">Locker Number</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter locker number (0-255)"
                  className="input input-bordered w-full max-w-xs"
                  value={lockerNumberInput}
                  onChange={(e) => setLockerNumberInput(e.target.value)}
                  min="0"
                  max="255"
                />
              </div>
              {error && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </div>
              )}
              <button
                className={`btn btn-primary mt-4 ${isLoading ? "loading" : ""}`}
                onClick={handleSignMessage}
                disabled={isLoading || !lockerNumberInput}
              >
                {isLoading ? "Opening..." : "Sign and Open Locker"}
              </button>
            </div>
            
            <Link 
              href="/" 
              className="btn btn-primary mt-8 flex items-center gap-2"
            >
              <HomeIcon className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpenLockerPage; 