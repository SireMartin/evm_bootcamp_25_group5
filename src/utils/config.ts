// =====================================================
// CONFIGURATION FILE - UPDATE WITH YOUR CONTRACT ADDRESSES
// =====================================================
// 
// To use this DApp with your own contracts:
// 1. Deploy the Lottery and LotteryToken contracts to the Sepolia testnet
// 2. Replace the addresses below with your deployed contract addresses
// 3. Make sure you're using the Sepolia testnet in MetaMask

// Contract addresses - replace these with your deployed contract addresses
export const LOTTERY_ADDRESS = "0x60291d06f33c29c5056e7c664c2ce001983f3680"; // Your deployed lottery contract address
export const LOTTERY_TOKEN_ADDRESS = "0xAbEaC8f69dd2A41E42A170a1Ba63fa2cD474bCef"; // Your deployed token contract address

// Network configuration
export const CHAIN_ID = 11155111; // Sepolia testnet
export const RPC_URL = "https://sepolia.infura.io/v3/377b2831d5634731b95a38162386ece1"; // Your Infura project ID

// UI Constants
export const BET_PRICE = "0.01"; // Price per bet in ETH
export const BET_FEE = "0.001"; // Fee per bet in ETH
export const PURCHASE_RATIO = "1000"; // Number of tokens per ETH 

// Validation function to check if addresses are set
export const validateAddresses = () => {
  // Check if addresses are valid Ethereum addresses
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(LOTTERY_ADDRESS)) {
    console.error("ERROR: Invalid lottery contract address format");
    return false;
  }
  
  if (!addressRegex.test(LOTTERY_TOKEN_ADDRESS)) {
    console.error("ERROR: Invalid lottery token contract address format");
    return false;
  }
  
  return true;
}; 