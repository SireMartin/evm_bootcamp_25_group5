"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const LockerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Potato Locker</span>
            <span className="block text-4xl font-bold">Under Construction</span>
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
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-xl font-bold">Coming Soon</p>
              <p className="mt-2">
                The locker system is currently under development. Please check back later!
              </p>
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

export default LockerPage; 