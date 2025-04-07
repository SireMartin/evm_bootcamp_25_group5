import { formatEther, parseEther } from "viem";

// Format a number to a fixed number of decimal places
export const formatNumber = (number: number, decimals: number = 2): string => {
  return Number(number).toFixed(decimals);
};

// Format an amount in wei to ETH
export const formatEth = (wei: bigint): string => {
  return formatEther(wei);
};

// Parse an ETH amount to wei
export const parseEth = (eth: string): bigint => {
  return parseEther(eth);
};

// Format a timestamp to a readable date string
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Calculate time remaining until a timestamp
export const getTimeRemaining = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff <= 0) {
    return "Expired";
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// Truncate an Ethereum address
export const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Check if a value is a valid number
export const isValidNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && Number(value) > 0;
};

// Check if a value is a valid Ethereum address
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}; 