"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useSignMessage } from "wagmi";
import type { SignableMessage } from "viem";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const OpenLockerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [lockerNumber, setLockerNumber] = useState<number>(0);
  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: (data: `0x${string}`, variables: { message: SignableMessage }) => {
        console.log("Signature:", data);
        // TODO: Send signature to backend
      },
    },
  });

  const handleLockerNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 255) {
      setLockerNumber(value);
    }
  };

  const handleSignMessage = () => {
    signMessage({ message: `Open locker ${lockerNumber}` });
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Open Locker</span>
            <span className="block text-4xl font-bold">Enter Locker Number</span>
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
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Locker Number (0-255)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={lockerNumber}
                  onChange={handleLockerNumberChange}
                  className="input input-bordered w-full max-w-xs"
                />
              </div>
              <button
                className="btn btn-primary mt-4"
                onClick={handleSignMessage}
              >
                Sign and Open Locker
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