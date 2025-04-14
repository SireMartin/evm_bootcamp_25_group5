"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { parseEther } from "viem";

const continents = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

export default function Webshop() {
  const [amount, setAmount] = useState<number>(1);
  const [selectedContinent, setSelectedContinent] = useState<string>("Europe");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync: writePotatoVendorAsync } = useScaffoldWriteContract({
    contractName: "Potato",
  });

  const handleBuyPotatoes = async () => {
    try {
      setIsLoading(true);
      // Price per potato in ETH (example: 0.001 ETH per potato)
      const pricePerPotato = parseEther("0.001");
      const totalPrice = pricePerPotato * BigInt(amount);

      // await writePotatoVendorAsync({
      //   functionName: "buyPotatoes",
      //   args: [BigInt(amount), selectedContinent],
      //   value: totalPrice,
      // });
    } catch (error) {
      console.error("Error buying potatoes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Potato Webshop</span>
        </h1>
        
        <div className="mt-8 max-w-md mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount of Potatoes</span>
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Delivery Continent</span>
            </label>
            <div className="space-y-2">
              {continents.map((continent) => (
                <label key={continent} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="continent"
                    value={continent}
                    checked={selectedContinent === continent}
                    onChange={(e) => setSelectedContinent(e.target.value)}
                    className="radio"
                  />
                  <span>{continent}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-lg">
              Price per potato: 0.001 ETH
            </p>
            <p className="text-lg font-bold">
              Total price: {(0.001 * amount).toFixed(3)} ETH
            </p>
          </div>

          <button
            className="btn btn-primary w-full mt-6"
            onClick={handleBuyPotatoes}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Buy Potatoes"}
          </button>
        </div>
      </div>
    </div>
  );
} 