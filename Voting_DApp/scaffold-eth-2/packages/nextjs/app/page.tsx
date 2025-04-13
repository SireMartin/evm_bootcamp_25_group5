"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import React from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { parseEther, formatEther, hexToString } from "viem";
import { requestMint } from "~~/utils/api/mint";


// Define styles as JavaScript objects

const cardTitleStyle = {
  fontSize: "1.8rem",
  fontWeight: "bold",
  marginBottom: "20px",
};

const tableContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
};

const tableStyle = {
  width: "90%",
  borderCollapse: "collapse" as const,
  textAlign: "center" as const,
  fontFamily: "Arial, sans-serif",
};

const thStyle = {
  fontWeight: "bold",
  fontSize: "1.1rem",
  backgroundColor: "#f1f1f1",
  padding: "10px",
  textAlign: "center" as const,
};

const tdStyle = {
  padding: "10px",
  textAlign: "center" as const,
  fontSize: "1rem",
  border: "1px solid #ddd",
};

const evenRowStyle = {
  backgroundColor: "#f9f9f9",
};

const oddRowStyle = {
  backgroundColor: "#ffffff",
};


// MAIN

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-3xl mb-4">Welcome to</span>
            <span className="block text-5xl font-bold">Encode EVM Bootcamp 2025</span>
          </h1>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};


function PageBody() {
  return (
    <>
      <h1 className="text-center mb-8">
        <span className="block text-3xl mb-2">Homework n.4</span>
        <span className="block text-2xl mb-2">Group n.5</span>
      </h1>
      <WalletInfo></WalletInfo>
    </>
  );
}


// Interacting with the wallet using wagmi

function WalletInfo() {
  const { address, isConnecting, isDisconnected, chain } = useAccount();            // from wagmi (solved by pressing "ctrl+." on the issue highlighted -> Intellisense)
  if (address)
    return (
      <div>
        <h1 className="text-center">
          <p>Your account address is {address}</p>
          <p>Connected to the network {chain?.name}</p>
        </h1>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <ApiData address={address as `0x${string}`}></ApiData>
        {/* <ApiDataMinting></ApiDataMinting> */}
        <ApiDataVoting></ApiDataVoting>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <h1 className="text-center">
          <p>Loading...</p>
        </h1>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <h1 className="text-center">
          <p>Wallet disconnected. Connect wallet to continue.</p>
        </h1>
      </div>
    );
  return (
    <div>
      <h1 className="text-center">
        <p>Connect wallet to continue.</p>
      </h1>
    </div>
  );
}


// Wallet balance

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div className="card card-compact text-center w-96 bg-primary text-primary-content mt-4">
        <div className="card-body items-center text-center">
          <h2 style={cardTitleStyle}>User Balance</h2>
          <div className="card-actions items-center flex-col gap-1 text-lg">
            Balance: {data?.formatted} {data?.symbol}
          </div>
        </div>
      </div>
    </div> 
  );
}


// Interacting with smart contracts using viem

// Querying Token name, Token symbol, user Token balance and Token total supply

function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div className="card card-compact text-center w-96 bg-primary text-primary-content mt-4">
        <div className="card-body items-center text-center">
          <h2 style={cardTitleStyle}>Token Contract Info</h2>
          <div className="card-actions items-center flex-col gap-1 text-lg">
            <TokenName></TokenName>
            <TokenSymbol></TokenSymbol>
            <TokenSupply></TokenSupply>
            <TokenBalance address={params.address}></TokenBalance>
          </div>
        </div>
      </div>
    </div> 
  );
}


// Token name

function TokenName() {
  const { data, isError, isLoading } = useReadContract({
    // address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",                          // MyToken contract address (Hardhat)
    // address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",                          // MyToken contract address (Hardhat)
    // address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",                          // MyToken contract address (Hardhat)
    address: "0xeEcC10D784B07eFA9b9A362Fa7F784457c53d622",                          // MyToken contract address (Sepolia)
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token name: {name}</div>;
}


// Token symbol

function TokenSymbol() {
  const { data, isError, isLoading } = useReadContract({
    // address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",                          // MyToken contract address (Hardhat)
    // address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",                          // MyToken contract address (Hardhat)
    // address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",                          // MyToken contract address (Hardhat)
    address: "0xeEcC10D784B07eFA9b9A362Fa7F784457c53d622",                          // MyToken contract address (Sepolia)
    abi: [
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "symbol",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching symbol…</div>;
  if (isError) return <div>Error fetching symbol</div>;
  return <div>Token symbol: {name}</div>;
}


// Token balance

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useReadContract({
    // address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",                          // MyToken contract address (Hardhat)
    // address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",                          // MyToken contract address (Hardhat)
    // address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",                          // MyToken contract address (Hardhat)
    address: "0xeEcC10D784B07eFA9b9A362Fa7F784457c53d622",                          // MyToken contract address (Sepolia)
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = typeof data === "bigint" ? formatEther(data) : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>User Token Balance: {balance}</div>;
}


// Token supply

function TokenSupply() {
  const { data, isError, isLoading } = useReadContract({
    // address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",                          // MyToken contract address (Hardhat)
    // address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",                          // MyToken contract address (Hardhat)
    // address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",                          // MyToken contract address (Hardhat)
    address: "0xeEcC10D784B07eFA9b9A362Fa7F784457c53d622",                          // MyToken contract address (Sepolia)
    abi: [
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "totalSupply",
  });

  const supply = typeof data === "bigint" ? formatEther(data) : 0;

  if (isLoading) return <div>Fetching token supply…</div>;
  if (isError) return <div>Error fetching total supply.</div>;
  return <div>Token Total Supply: {supply}</div>;
}


// Coupling FrontEnd to the BackEnd

function ApiData(params: { address: `0x${string}` }) {
// function ApiDataMinting() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div className="card text-center w-120 bg-primary text-primary-content mt-8">
        <div className="card-body items-center text-center">
          <h2 style={cardTitleStyle}>Testing API Minting</h2>
          <div className="card-actions items-center flex-col gap-1 text-lg">
            {/* <TokenAddressFromApi></TokenAddressFromApi> */}
            <RequestTokens address={params.address}></RequestTokens>
            {/* <MintTest></MintTest> */}
          </div>
        </div>
      </div>
    </div>
  );
}


/* // Token Address from API

function TokenAddressFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/contract-address")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No token address information</p>;

  return (
    <div>
      <p>Token address from API: {data.result}</p>
    </div>
  );
} */


// Request tokens

function RequestTokens(params: { address: string }) {
  const [amount, setAmount] = useState<string>("1");
  const [status, setStatus] = useState<string>("");
  const [data, setData] = useState<{ result?: { message: string; hash: string } }>();
  const [isLoading, setLoading] = useState(false);

  const address = params.address;

  if (isLoading) return <p>Requesting tokens from API...</p>;

  if (!data || !data.result)
    return (
      <div className="flex flex-col gap-4 p-4 bg-base-200 rounded-lg">
        <h2 className="text-xl font-bold">Request Tokens</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Amount to Mint:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input input-bordered text-center"
            min="0"
            step="1"
          />
        </div>
        <button
          className={`btn btn-primary ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
          onClick={() => {
            console.log("Mint Tokens button clicked");
            try {
              const amountInWei = parseEther(amount).toString();                    // Convert amount to wei
              console.log("Amount in wei:", amountInWei);

              setLoading(true);
              fetch(`http://localhost:3001/mint-tokens/${address}/${amountInWei}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),                                           // Send an empty body since the backend doesn't use it
              })
                .then((res) => {
                  console.log("Response status:", res.status);
                  if (!res.ok) {
                    throw new Error("Failed to fetch");
                  }
                  return res.json();
                })
                .then((data) => {
                  console.log("Response data:", data);
                  setData(data);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Fetch error:", error);
                  setStatus("Error minting tokens");
                  setLoading(false);
                });
            } catch (error) {
              console.error("Error parsing amount to wei:", error);
              setStatus("Invalid amount entered");
            }
          }}
        >
          {isLoading ? "Minting..." : "Mint Tokens"}
        </button>
        {status && <p className="text-sm text-red-500">{status}</p>}
      </div>
    );

  return (
    <div>
      <p>Result from API: {data.result?.message}</p>
      <p>
        Transaction Hash:{" "}
        <span className="text-blue-500 font-medium">{data.result?.hash}</span>
      </p>
    </div>
  );
}

// export const MintTest = () => {

//   const { address } = useAccount();
//   const [amount, setAmount] = useState<string>("1");
//   const [status, setStatus] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
  
//   const handleMint = async () => {

//     if (!address) {
//       setStatus("Please connect your wallet first");
//       return;
//     }
  
//     setIsLoading(true);
//     setStatus("Minting tokens...");
  
//     try {
//       const result = await requestMint(address, parseInt(amount));
//       if (result.success) {
//         setStatus(`Success! Transaction hash: ${result.transactionHash}`);
//       } else {
//         setStatus(`Error: ${result.error}`);
//       }
//     } catch (error) {
//       setStatus(`Error: ${error instanceof Error ? error.message : "Failed to mint tokens."}`);
//     } finally {
//       setIsLoading(false);
//       setAmount("1");
//     }

//   };
  
//   return (
//     <div className="flex flex-col gap-4 p-4 bg-base-200 rounded-lg">
//       <h2 className="text-xl font-bold">Request Tokens</h2>
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium">Amount to Mint:</label>
//         <input
//           type="number"
//           value={amount}
//           onChange={e => setAmount(e.target.value)}
//           className="input input-bordered text-center"
//           min="0"
//           step="1"
//         />
//       </div>
//       <button
//         className={`btn btn-primary ${isLoading ? "loading" : ""}`}
//         onClick={handleMint}
//         disabled={isLoading || !address}
//       >
//         {isLoading ? "Minting..." : "Mint Tokens"}
//       </button>
//       {!address && <p className="text-warning">Please connect your wallet first</p>}
//       {status && <p className="text-sm">{status}</p>}
//     </div>
//   );

// };


// Querying Ballot results

function ApiDataVoting() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div className="card text-center w-120 bg-primary text-primary-content mt-8">
        <div className="card-body items-center text-center">
          <h2 style={cardTitleStyle}>Testing API Voting</h2>
          <div className="card-actions items-center flex-col gap-1 text-lg">
            <Proposals></Proposals>
            {/* Add margin-top to create space between Proposals and VoteList */}
            <div className="mt-6">
              <VoteList></VoteList>
            </div>
            {/* Add margin-top to create space between Proposals and VoteList */}
            <div className="mt-6">
              <WinnerName></WinnerName>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Proposals

function Proposals() {
  const proposalColl = ["Biaggi", "Stoner", "Rossi", "Marquez"];
  return (
    <div className="card card-bordered shadow-lg p-4 items-center justify-center w-full">
      {/* Title of the external card */}
      <h2 className="text-2xl font-bold text-center mb-6">Proposals</h2>
      
      {/* Container for the smaller cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {proposalColl.map((proposal, index) => (
          <div
            key={index}
            className="card card-compact bg-primary text-primary-content p-4"
          >
            <div className="card-body items-center text-center">
              {/* Display proposal with index */}
              <h3 className="text-lg font-semibold">
                {`n.${index}: ${proposal}`}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// Vote list

function VoteList() {
  const [votes, setVotes] = useState<
    { voter: string; proposal: number; amount: string }[]
  >([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p>Retrieving info from API...</p>;

  if (error) return <p>Error: {error}</p>;

  if (votes.length === 0)
    return (
      <div>
        <button
          className="btn btn-active btn-neutral"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetch("http://localhost:3001/vote-list", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
              })
              .then((data) => {
                if (data.result && Array.isArray(data.result)) {
                  setVotes(data.result);
                } else {
                  throw new Error("Unexpected response format: 'result' not found or not an array");
                }
                setLoading(false);
              })
              .catch((err) => {
                console.error("Error fetching vote list:", err);
                setError(err.message);
                setLoading(false);
              });
          }}
        >
          Retrieve Vote List
        </button>
      </div>
    );

  return (
    <div>
      <h3 style={cardTitleStyle}>Vote List</h3>
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Voter</th>
              <th style={thStyle}>Proposal</th>
              <th style={thStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote, index) => (
              <tr
                key={index}
                style={index % 2 === 0 ? evenRowStyle : oddRowStyle}                // Alternate row colors
              >
                <td style={tdStyle}>{vote.voter}</td>
                <td style={tdStyle}>{vote.proposal}</td>
                <td style={tdStyle}>{vote.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// Winner Name

function WinnerName() {
  const { data, isError, isLoading } = useReadContract({
    // address: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",                          // TokenizedBallot contract address (Hardhat)
    address: "0x0BF8a128e27070b6f5d842aA659ed813f944A514",                          // TokenizedBallot contract address (Sepolia)
    abi: [
      {
        constant: true,
        inputs: [],
        name: "winnerName",
        outputs: [
          {
            name: "winnerName_",
            type: "bytes32",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "winnerName",
  });

  const winner = typeof data === "string" ? hexToString(data, { size: 32 }) : "";

  if (isLoading) return <div>Fetching winner name…</div>;
  if (isError) return <div>Error fetching winner name. Nobody has voted yet.</div>;
  return (
    <div>
      <h2 className="text-center text-3xl font-bold text-center mb-6">
        <p>Winner: {winner}</p>
      </h2>
    </div>
  );
}

export default Home;