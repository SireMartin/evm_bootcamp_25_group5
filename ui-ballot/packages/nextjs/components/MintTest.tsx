import { useState } from "react";
import { useAccount } from "wagmi";
import { requestMint } from "~~/utils/api/mint";

export const MintTest = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState<string>("1");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    if (!address) {
      setStatus("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setStatus("Minting tokens...");

    try {
    //  const result = await requestMint(address, parseFloat(amount));
      const result = await requestMint(address, parseInt(amount));
      if (result.success) {
        setStatus(`Success! Transaction hash: ${result.transactionHash}`);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Failed to mint tokens"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-base-200 rounded-lg">
      <h2 className="text-xl font-bold">Test Token Minting</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Amount to Mint:</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="input input-bordered"
          min="0"
//          step="0.1"
          step="1"
        />
      </div>
      <button
        className={`btn btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleMint}
        disabled={isLoading || !address}
      >
        {isLoading ? "Minting..." : "Mint Tokens"}
      </button>
      {!address && <p className="text-warning">Please connect your wallet first</p>}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}; 
