import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, useSimulateContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { LOTTERY_ABI } from '../utils/contracts';
import { LOTTERY_ADDRESS, validateAddresses } from '../utils/config';

export function useLotteryContract() {
  const [contractAddress, setContractAddress] = useState<string>(LOTTERY_ADDRESS);
  const [isValid, setIsValid] = useState<boolean>(false);
  
  // Validate contract address on mount
  useEffect(() => {
    setIsValid(validateAddresses());
  }, []);
  
  // Read contract state
  const { data: isBetsOpen, error: isBetsOpenError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'betsOpen',
    args: [],
    watch: true,
  });
  
  const { data: betsClosingTime, error: betsClosingTimeError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'betsClosingTime',
    args: [],
    watch: true,
  });
  
  const { data: prizePool, error: prizePoolError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'prizePool',
    args: [],
    watch: true,
  });
  
  const { data: ownerPool, error: ownerPoolError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'ownerPool',
    args: [],
    watch: true,
  });
  
  const { data: owner, error: ownerError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'owner',
    args: [],
    enabled: isValid,
  });
  
  // Simulate contract writes
  const { data: openBetsSimulation, error: openBetsSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'openBets',
    args: [BigInt(Math.floor(Date.now() / 1000) + 3600)], // Default to 1 hour in the future
    enabled: isValid,
  });
  
  const { data: closeLotterySimulation, error: closeLotterySimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'closeLottery',
    enabled: isValid,
  });
  
  const { data: buyTokensSimulation, error: buyTokensSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'purchaseTokens',
    enabled: isValid,
  });
  
  const { data: betSimulation, error: betSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'bet',
    enabled: isValid,
  });
  
  const { data: betManySimulation, error: betManySimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'betMany',
    enabled: isValid,
  });
  
  const { data: prizeWithdrawSimulation, error: prizeWithdrawSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'prizeWithdraw',
    enabled: isValid,
  });
  
  const { data: ownerWithdrawSimulation, error: ownerWithdrawSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'ownerWithdraw',
    enabled: isValid,
  });
  
  const { data: returnTokensSimulation, error: returnTokensSimulationError } = useSimulateContract({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'returnTokens',
    enabled: isValid,
  });
  
  // Contract writes
  const { writeContract: openBetsWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'openBets',
  });
  const { writeContract: closeLotteryWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'closeLottery',
  });
  const { writeContract: buyTokensWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'purchaseTokens',
  });
  const { writeContract: betWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'bet',
  });
  const { writeContract: betManyWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'betMany',
  });
  const { writeContract: prizeWithdrawWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'prizeWithdraw',
  });
  const { writeContract: ownerWithdrawWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'ownerWithdraw',
  });
  const { writeContract: returnTokensWrite } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'returnTokens',
  });
  
  // Helper functions
  const openBets = async (closingTime: number) => {
    if (!openBetsWrite) {
      console.error('openBetsWrite is not available');
      return;
    }
    
    try {
      console.log('Opening bets with closing time:', new Date(closingTime * 1000).toLocaleString());
      
      // Call the contract write function with the closing time
      const tx = await openBetsWrite({
        args: [BigInt(closingTime)],
      });
      
      console.log('Bets opened successfully, transaction hash:', tx);
      
      // Wait for the transaction to be mined
      console.log('Waiting for transaction to be mined...');
      
      // Return the transaction hash for potential use
      return tx;
    } catch (error) {
      console.error('Error opening bets:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };
  
  const closeLottery = async () => {
    if (!closeLotteryWrite || !closeLotterySimulation) {
      console.error('closeLotteryWrite or closeLotterySimulation is not available');
      if (closeLotterySimulationError) {
        console.error('Simulation error:', closeLotterySimulationError);
      }
      return;
    }
    
    try {
      const { request } = closeLotterySimulation;
      await closeLotteryWrite(request);
      console.log('Lottery closed successfully');
    } catch (error) {
      console.error('Error closing lottery:', error);
      throw error;
    }
  };
  
  const buyTokens = async (amount: bigint) => {
    if (!buyTokensWrite || !buyTokensSimulation) {
      console.error('buyTokensWrite or buyTokensSimulation is not available');
      if (buyTokensSimulationError) {
        console.error('Simulation error:', buyTokensSimulationError);
      }
      return;
    }
    
    try {
      const { request } = buyTokensSimulation;
      await buyTokensWrite({
        ...request,
        value: amount,
      });
      console.log('Tokens bought successfully');
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  };
  
  const bet = async () => {
    if (!betWrite || !betSimulation) {
      console.error('betWrite or betSimulation is not available');
      if (betSimulationError) {
        console.error('Simulation error:', betSimulationError);
      }
      return;
    }
    
    try {
      const { request } = betSimulation;
      await betWrite(request);
      console.log('Bet placed successfully');
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };
  
  const betMany = async (amount: number) => {
    if (!betManyWrite || !betManySimulation) {
      console.error('betManyWrite or betManySimulation is not available');
      if (betManySimulationError) {
        console.error('Simulation error:', betManySimulationError);
      }
      return;
    }
    
    try {
      const { request } = betManySimulation;
      await betManyWrite({
        ...request,
        args: [BigInt(amount)],
      });
      console.log('Multiple bets placed successfully');
    } catch (error) {
      console.error('Error placing multiple bets:', error);
      throw error;
    }
  };
  
  const prize = async (address: string) => {
    try {
      const response = await fetch(`/api/prize?address=${address}&contractAddress=${contractAddress}`);
      const data = await response.json();
      return BigInt(data.prize || 0);
    } catch (error) {
      console.error('Error fetching prize:', error);
      return BigInt(0);
    }
  };
  
  const prizeWithdraw = async (amount: bigint) => {
    if (!prizeWithdrawWrite || !prizeWithdrawSimulation) return;
    
    try {
      const { request } = prizeWithdrawSimulation;
      await prizeWithdrawWrite({
        ...request,
        args: [amount],
      });
    } catch (error) {
      console.error('Error withdrawing prize:', error);
    }
  };
  
  const ownerWithdraw = async (amount: bigint) => {
    if (!ownerWithdrawWrite || !ownerWithdrawSimulation) return;
    
    try {
      const { request } = ownerWithdrawSimulation;
      await ownerWithdrawWrite({
        ...request,
        args: [amount],
      });
    } catch (error) {
      console.error('Error withdrawing owner pool:', error);
    }
  };
  
  const returnTokens = async (amount: bigint) => {
    if (!returnTokensWrite || !returnTokensSimulation) return;
    
    try {
      const { request } = returnTokensSimulation;
      await returnTokensWrite({
        ...request,
        args: [amount],
      });
    } catch (error) {
      console.error('Error returning tokens:', error);
    }
  };
  
  // Return validation status
  return {
    contractAddress,
    isValid,
    isBetsOpen,
    betsClosingTime,
    prizePool,
    ownerPool,
    owner,
    openBets,
    closeLottery,
    buyTokens,
    bet,
    betMany,
    prize,
    prizeWithdraw,
    ownerWithdraw,
    returnTokens
  };
} 