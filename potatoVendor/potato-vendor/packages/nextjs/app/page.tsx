"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ShoppingBagIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Potato Vendor</span>
          </h1>
          <div className="flex justify-center my-4">
            <Image
            src="/images/super_potato.png"                        // Path to the image
            alt="Super Potato"                                    // Alt text for accessibility
            width={400}                                           // Adjust width as needed
            height={400}                                          // Adjust height as needed
            priority                                              // Optional: Ensure the image loads quickly
          />
        </div>
        {connectedAddress && (
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        )}
      </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <Link href="/permit" className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:bg-base-200 transition-colors">
              <ShoppingBagIcon className="h-8 w-8 fill-secondary" />
              <p className="mt-4 text-xl font-bold">Buy Potatoes</p>
              <p className="mt-2">
                Purchase fresh potatoes using our token permit system
              </p>
            </Link>
            <Link href="/locker" className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:bg-base-200 transition-colors">
              <LockClosedIcon className="h-8 w-8 fill-secondary" />
              <p className="mt-4 text-xl font-bold">Open Locker</p>
              <p className="mt-2">
                Access your purchased potatoes from your assigned locker
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
