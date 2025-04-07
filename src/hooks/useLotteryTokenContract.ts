import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useSimulateContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { LOTTERY_TOKEN_ABI } from '../utils/contracts';
import { LOTTERY_TOKEN_ADDRESS, validateAddresses } from '../utils/config';

export function useLotteryTokenContract(lotteryAddress: string | undefined) {
  const [tokenAddress, setTokenAddress] = useState<string | undefined>(LOTTERY_TOKEN_ADDRESS);
  const [isValid, setIsValid] = useState<boolean>(false);
  
  // Validate contract address on mount
  useEffect(() => {
    setIsValid(validateAddresses());
  }, []);
  
  // Read contract state
  const { data: balanceOfData, error: balanceOfError } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: LOTTERY_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [],
    enabled: !!tokenAddress && isValid,
  });
  
  // Simulate contract writes
  const { data: approveSimulation, error: approveSimulationError } = useSimulateContract({
    address: tokenAddress as `0x${string}`,
    abi: LOTTERY_TOKEN_ABI,
    functionName: 'approve',
    enabled: !!tokenAddress && !!lotteryAddress && isValid,
  });
  
  // Contract writes
  const { writeContract: approveWrite } = useContractWrite();
  
  // Helper functions
  const balanceOf = async (address: string) => {
    try {
      const response = await fetch(`/api/token-balance?address=${address}&tokenAddress=${tokenAddress}&contractAddress=${lotteryAddress}`);
      const data = await response.json();
      console.log('Token balance response:', data);
      
      // Convert the balance to a more readable format
      const balance = data.balance ? formatEther(BigInt(data.balance)) : '0';
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  };
  
  const approve = async (amount: bigint) => {
    if (!approveWrite || !approveSimulation || !lotteryAddress) return;
    
    try {
      const { request } = approveSimulation;
      await approveWrite({
        ...request,
        args: [lotteryAddress as `0x${string}`, amount],
      });
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };
  
  // Return validation status
  return {
    tokenAddress,
    isValid,
    balanceOf,
    approve
  };
} 