"use client"

import { NextPage } from "next";
import { useState } from "react";
import { Address, getAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Vote: NextPage = () => {
    const { data: shebangContractData } = useDeployedContractInfo({ contractName: "Shebang" });
    const { address, isConnecting, isDisconnected, chain } = useAccount();
    const [delegateAddress, setDelegateAddress] = useState();
    const { writeContract } = useWriteContract();
    const waitForTransR = useWaitForTransactionReceipt();

    const delegateTokenContract = (address: Address) => {
        try {
            //console.log(shebangContractData?.address, "/", address)
            const data = writeContract({
                abi: shebangContractData?.abi,
                address: shebangContractData?.address as Address,
                functionName: "delegate", 
                args: [ getAddress(address) ]
            });
            
        } catch (error) {
            console.error("Transaction failed:", error);
        }
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
                    <AddressInput value={delegateAddress} onChange={(newAddress) => setDelegateAddress(newAddress)} />
                    <button className="btn btn-primary" onClick={() => delegateTokenContract(delegateAddress as Address)}>Delegate to</button>
                    <p className="text-center text-lg">Voting</p>
                    <ul>
                        {/* 
                          The curly braces {} mark the boundary between JSX and JavaScript.
                          Inside the braces, we can write any JavaScript expression.
                          Here we have an array ["maarten", "is", "the", "best"] 
                          and we call .map() on it to transform each element into JSX.
                          
                          The map callback (element, index) => (...) is JavaScript,
                          but returns JSX wrapped in parentheses ().
                          
                          Inside that JSX, we use {} again to inject the JavaScript 
                          variables 'index' and 'element' into the rendered output.
                        */}
                        {
                            ["maarten", "is", "the", "best"].map((element, index) => (
                                <li key={index}>{element}</li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Vote;