"use client";

import { use, useState } from "react";
import { useAccount, useSignTypedData, UseSignTypedDataReturnType } from "wagmi";
import { parseEther } from "viem";
import { Address, AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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

export default function PermitPage() {
  const { address } = useAccount();
  const [spender, setSpender] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");
  const [deadline, setDeadline] = useState<number>(0);
  const [nonce, setNonce] = useState<bigint>(0n);

  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({
    contractName: "Potato",
  });
  const {data: currentNonce} = useScaffoldReadContract({
    contractName: "Potato",
    functionName: "nonces",
    args: [address],
  });

  const handlePermit = async () => {
    try {
      // Get current timestamp and add 1 hour
      const currentTime = Math.floor(Date.now() / 1000);
      const newDeadline = currentTime + 3600; // 1 hour from now
      setDeadline(newDeadline);

      // Get current nonce from contract
      // Note: You'll need to implement this function in your contract
      
      setNonce(currentNonce as bigint);

      // Prepare permit data
      const domain = {
        name: "Potato",
        version: "1",
        chainId: 31337, // Hardhat network ID
        verifyingContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Replace with your token address
      };

      const message = {
        owner: address,
        spender,
        value: parseEther(amount),
        nonce: currentNonce,
        deadline: BigInt(newDeadline),
      };

      // Sign the permit
      const signature = await signTypedDataAsync({
        domain,
        types: PERMIT_TYPES,
        primaryType: "Permit",
        message,
      });

      // Execute permit
      await writeTokenAsync({
        functionName: "permit",
        args: [
          address,
          spender,
          parseEther(amount),
          BigInt(newDeadline),
          signature.v,
          signature.r,
          signature.s,
        ],
      });

      alert("Permit executed successfully!");
    } catch (error) {
      console.error("Error executing permit:", error);
      alert("Error executing permit. Check console for details.");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">ERC20 Permit</span>
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
              Deadline: {new Date(deadline * 1000).toLocaleString()}
            </p>
            <p className="text-lg">
              Nonce: {nonce.toString()}
            </p>
          </div>

          <button
            className="btn btn-primary w-full mt-6"
            onClick={handlePermit}
          >
            Execute Permit
          </button>
        </div>
      </div>
    </div>
  );
} 