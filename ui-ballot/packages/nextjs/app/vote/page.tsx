"use client"

import { dataTagSymbol } from "@tanstack/react-query";
import { NextPage } from "next";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { DeployContractData } from "wagmi/query";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Vote: NextPage = () => {
    const { data: shebangContractData } = useDeployedContractInfo({ contractName: "Shebang" });
    const { address, isConnecting, isDisconnected, chain } = useAccount();
    const [ delegateAddress, setDelegateAddress ] = useState("");
    const { writeContract } = useWriteContract({
        abi: shebangContractData?.abi,
        address: shebangContractData?.address as "0x${string}",
        functionName: "delegate",
    });

    const delegateTokenContract = (address: "0x${string}") => {
        console.log(shebangContractData?.address, "/", address  )
        writeContract({ args: [address as "0x${string}"] });
    };

    return (
        <>
            <div className="flex items-center flex-col flex-grow pt-10">
                <div className="px-5">
                    <h1 className="text-center mb-8">
                        <span className="block text-2xl mb-2">Welcome to</span>
                        <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
                    </h1>
                    <p className="text-center text-lg">
                        Get started by editing{" "}
                        <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                            packages/nextjs/pages/index.tsx
                        </code>
                    </p>
                    <p className="text-center text-lg">Delegation</p>
                    <AddressInput value={address as string} onChange={(newAddress) => setDelegateAddress(newAddress)} />
                    <button className="btn btn-primary" onClick={() => delegateTokenContract(delegateAddress as "0x${string}")}>Delegate to</button>
                </div>
            </div>
        </>
    );
};

export default Vote;