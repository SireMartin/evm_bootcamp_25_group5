"use client"

import { NextPage } from "next";
import { useState, useEffect } from "react";
import { Address, getAddress, parseEther, formatEther } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Vote: NextPage = () => {
    const { data: shebangContractData } = useDeployedContractInfo({ contractName: "Shebang" });
    const { data: ballotContractData } = useDeployedContractInfo({ contractName: "TokenizedBallot" });
    const { address, isConnecting, isDisconnected, chain } = useAccount();
    const [delegateAddress, setDelegateAddress] = useState<Address | undefined>();
    const [voteAmount, setVoteAmount] = useState<string>("");
    const [voteStatus, setVoteStatus] = useState<string>("");
    const { writeContract } = useWriteContract();
    const waitForTransR = useWaitForTransactionReceipt();

    // Read proposals from the ballot contract
    const { data: proposals } = useReadContract({
        address: ballotContractData?.address as Address,
        abi: ballotContractData?.abi as any,
        functionName: "proposals",
        args: [0n], // Read first proposal to get array length
    });

    // Read remaining voting power
    const { data: remainingVotingPower, refetch } = useReadContract({
        address: ballotContractData?.address as Address,
        abi: ballotContractData?.abi as any,
        functionName: "getRemainingVotingPower",
        args: [address as Address],
    });

    // Read current voting power from token contract
    const { data: currentVotingPower } = useReadContract({
        address: shebangContractData?.address as Address,
        abi: shebangContractData?.abi as any,
        functionName: "getVotes",
        args: [address as Address],
    });

    // Read delegated address
    const { data: delegatedAddress } = useReadContract({
        address: shebangContractData?.address as Address,
        abi: shebangContractData?.abi as any,
        functionName: "delegates",
        args: [address as Address],
    }) as { data: Address | undefined };

    useEffect(() => {
        if (address) {
            refetch();
        }
    }, [address, refetch]);

    const delegateTokenContract = (address: Address) => {
        try {
            const data = writeContract({
                abi: shebangContractData?.abi as any,
                address: shebangContractData?.address as Address,
                functionName: "delegate", 
                args: [ getAddress(address) ]
            });
            
        } catch (error) {
            console.error("Transaction failed:", error);
        }
    };

    const undelegateTokenContract = () => {
        try {
            writeContract({
                abi: shebangContractData?.abi as any,
                address: shebangContractData?.address as Address,
                functionName: "delegate", 
                args: [ "0x0000000000000000000000000000000000000000" as Address ]
            });
        } catch (error) {
            console.error("Undelegation failed:", error);
        }
    };

    const vote = async (proposalIndex: number) => {
        try {
            if (!voteAmount) {
                setVoteStatus("Please enter an amount to vote");
                return;
            }
            const amountInWei = parseEther(voteAmount);
            
            if (amountInWei > (remainingVotingPower as bigint)) {
                setVoteStatus("You don't have enough voting power");
                return;
            }

            setVoteStatus("Voting in progress...");
            const tx = await writeContract({
                abi: ballotContractData?.abi as any,
                address: ballotContractData?.address as Address,
                functionName: "vote",
                args: [BigInt(proposalIndex), amountInWei]
            });
            setVoteStatus("Vote submitted successfully!");
        } catch (error: any) {
            console.error("Voting failed:", error);
            setVoteStatus("Voting failed: " + (error.message || "Unknown error"));
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
                    <AddressInput value={delegateAddress || ""} onChange={(newAddress) => setDelegateAddress(newAddress)} />
                    <div className="flex gap-2">
                        <button className="btn btn-primary" onClick={() => delegateTokenContract(delegateAddress as Address)}>Delegate to</button>
                        <button className="btn btn-secondary" onClick={undelegateTokenContract}>Undelegate</button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-base-200 rounded-lg">
                        <h2 className="text-lg font-bold mb-2">Your Voting Power Status:</h2>
                        {currentVotingPower !== undefined && (
                            <p>Current Voting Power: {formatEther(currentVotingPower as bigint)} SHB</p>
                        )}
                        {remainingVotingPower !== undefined && (
                            <p>Remaining Voting Power: {formatEther(remainingVotingPower as bigint)} SHB</p>
                        )}
                        {delegatedAddress && (
                            <p>Delegated to: {delegatedAddress as Address}</p>
                        )}
                    </div>
                    
                    <p className="text-center text-lg mt-8">Voting</p>
                    <div className="flex flex-col gap-4">
                        <input
                            type="number"
                            placeholder="Amount to vote (in SHB)"
                            className="input input-bordered w-full"
                            value={voteAmount}
                            onChange={(e) => setVoteAmount(e.target.value)}
                        />
                        {voteStatus && (
                            <div className={`alert ${voteStatus.includes("failed") ? "alert-error" : "alert-info"}`}>
                                {voteStatus}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["Biaggi", "Stoner", "Rossi", "Marquez"].map((proposal, index) => (
                                <button
                                    key={index}
                                    className="btn btn-primary"
                                    onClick={() => vote(index)}
                                >
                                    Vote for {proposal}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Vote;