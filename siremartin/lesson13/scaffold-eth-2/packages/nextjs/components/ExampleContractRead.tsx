"use client";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function ExampleContractRead() {
  const {
    data: helloWorld,
    isPending,
    isError,
    dataUpdatedAt,
  } = useScaffoldReadContract({
    contractName: "HelloWorld",
    functionName: "helloWorld",
  });

  if (isPending) return <p className="text-center text-lg">Loading...</p>;
  if (isError) return <p className="text-center text-lg">Error getting information from your contract</p>;

  return (
    <>
      <p className="text-center text-lg">The text from the contract is {helloWorld}</p>
      <p className="text-center text-sm">This data was last updated at {new Date(dataUpdatedAt).toLocaleString()}</p>
    </>
  );
}