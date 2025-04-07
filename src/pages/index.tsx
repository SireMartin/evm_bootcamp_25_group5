import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatEther, parseEther } from 'viem';
import { useLotteryContract } from '../hooks/useLotteryContract';
import { useLotteryTokenContract } from '../hooks/useLotteryTokenContract';
import dynamic from 'next/dynamic';

// Create a client-side only component to avoid hydration errors
const LotteryApp = () => {
  const { address, isConnected } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const [betAmount, setBetAmount] = useState('1');
  const [tokenAmount, setTokenAmount] = useState('1');
  const [duration, setDuration] = useState('3600');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState<boolean>(false);
  
  const { 
    contractAddress,
    isValid: isLotteryValid,
    isBetsOpen,
    betsClosingTime,
    prizePool,
    ownerPool,
    openBets,
    closeLottery,
    buyTokens,
    bet,
    betMany,
    prize,
    prizeWithdraw,
    ownerWithdraw,
    returnTokens,
    owner
  } = useLotteryContract();
  
  const {
    tokenAddress,
    isValid: isTokenValid,
    balanceOf,
    approve
  } = useLotteryTokenContract(contractAddress);

  const [userTokenBalance, setUserTokenBalance] = useState('0');
  const [userPrize, setUserPrize] = useState('0');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isPolling, setIsPolling] = useState<boolean>(false);
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === 11155111; // Sepolia chain ID
  
  // Function to fetch user data
  const fetchUserData = async () => {
    if (!address || !tokenAddress) return;
    
    try {
      setLoading(true);
      const [balance, prizeAmount] = await Promise.all([
        balanceOf(address),
        prize(address).then(prizeAmount => formatEther(prizeAmount))
      ]);
      
      setUserTokenBalance(balance);
      setUserPrize(prizeAmount);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch when address or tokenAddress changes
  useEffect(() => {
    if (address && tokenAddress) {
      fetchUserData();
    }
  }, [address, tokenAddress]);
  
  // Polling mechanism with interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Only start polling if user is connected and polling is enabled
    if (isConnected && isPolling) {
      // Fetch data immediately
      fetchUserData();
      
      // Set up interval for polling (every 30 seconds)
      intervalId = setInterval(fetchUserData, 30000);
    }
    
    // Clean up interval on unmount or when polling is disabled
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, isPolling, address, tokenAddress]);
  
  // Toggle polling
  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  // Handle MetaMask authorization error
  useEffect(() => {
    if (connectError && connectError.message.includes('not been authorized')) {
      setShowMetaMaskGuide(true);
    }
  }, [connectError]);

  // Function to switch to Sepolia network
  const handleSwitchNetwork = async () => {
    try {
      setLoading(true);
      setError(null);
      await switchChain({ chainId: 11155111 });
    } catch (err: any) {
      console.error('Error switching network:', err);
      setError(`Failed to switch network: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBets = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is the owner
      if (address !== owner) {
        console.log('Current user address:', address);
        console.log('Contract owner address:', owner);
        setError('Only the contract owner can open bets');
        setLoading(false);
        return;
      }
      
      // Check if bets are already open
      if (isBetsOpen) {
        setError('Bets are already open');
        setLoading(false);
        return;
      }
      
      // Calculate closing time: current timestamp + duration in seconds
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const closingTime = currentTimestamp + parseInt(duration);
      
      // Validate that the closing time is in the future
      if (closingTime <= currentTimestamp) {
        setError('Closing time must be in the future');
        setLoading(false);
        return;
      }
      
      console.log('Opening bets with closing time:', new Date(closingTime * 1000).toLocaleString());
      
      try {
        const tx = await openBets(closingTime);
        console.log('Transaction sent:', tx);
        
        // Wait a moment for the transaction to be mined
        console.log('Waiting for transaction to be mined...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Refresh data after successful transaction
        await fetchUserData();
        
        // Force a UI update by toggling polling
        setIsPolling(true);
        setTimeout(() => setIsPolling(false), 1000);
        
        console.log('Bets opened successfully, UI updated');
      } catch (txError) {
        console.error('Transaction error:', txError);
        if (txError instanceof Error) {
          setError(`Failed to open bets: ${txError.message}`);
        } else {
          setError('Failed to open bets: Unknown error');
        }
      }
    } catch (err: any) {
      console.error('Error opening bets:', err);
      setError(`Failed to open bets: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBets = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if bets are already closed
      if (!isBetsOpen) {
        setError('Bets are already closed');
        setLoading(false);
        return;
      }
      
      await closeLottery();
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error closing lottery:', err);
      setError(`Failed to close lottery: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      // Convert the token amount to ETH (1:1 ratio in this case)
      const ethAmount = tokenAmount;
      await buyTokens({ value: parseEther(ethAmount) });
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error buying tokens:', err);
      setError(`Failed to buy tokens: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBet = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if bets are open
      if (!isBetsOpen) {
        console.error('Bets are currently closed');
        setError('Bets are currently closed. Please wait for the owner to open bets.');
        setLoading(false);
        return;
      }
      
      // Check if user has enough tokens
      const currentBalance = parseFloat(userTokenBalance);
      const betAmountNum = parseFloat(betAmount);
      
      if (currentBalance < betAmountNum) {
        console.error('Insufficient token balance');
        setError(`Insufficient token balance. You have ${userTokenBalance} tokens, but trying to bet ${betAmount} tokens.`);
        setLoading(false);
        return;
      }
      
      console.log('Placing bet...');
      await bet();
      console.log('Bet placed successfully');
      
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error placing bet:', err);
      setError(`Failed to place bet: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBetMany = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if bets are open
      if (!isBetsOpen) {
        console.error('Bets are currently closed');
        setError('Bets are currently closed. Please wait for the owner to open bets.');
        setLoading(false);
        return;
      }
      
      // Check if user has enough tokens
      const currentBalance = parseFloat(userTokenBalance);
      const betAmountNum = parseFloat(betAmount);
      
      if (currentBalance < betAmountNum) {
        console.error('Insufficient token balance');
        setError(`Insufficient token balance. You have ${userTokenBalance} tokens, but trying to bet ${betAmount} tokens.`);
        setLoading(false);
        return;
      }
      
      console.log('Placing multiple bets...');
      await betMany(parseInt(betAmount));
      console.log('Multiple bets placed successfully');
      
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error placing multiple bets:', err);
      setError(`Failed to place multiple bets: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if there's a prize to claim
      if (userPrize === '0') {
        setError('You have no prize to claim');
        setLoading(false);
        return;
      }
      
      await prizeWithdraw(parseEther(userPrize));
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error claiming prize:', err);
      setError(`Failed to claim prize: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawOwnerPool = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if there's anything to withdraw
      if (ownerPool === '0') {
        setError('Owner pool is empty');
        setLoading(false);
        return;
      }
      
      await ownerWithdraw(parseEther(ownerPool));
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error withdrawing owner pool:', err);
      setError(`Failed to withdraw owner pool: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnTokens = async () => {
    if (!contractAddress) return;
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has enough tokens
      if (parseFloat(userTokenBalance) < parseFloat(tokenAmount)) {
        setError(`You don't have enough tokens. Your balance: ${userTokenBalance}`);
        setLoading(false);
        return;
      }
      
      await returnTokens(parseEther(tokenAmount));
      // Refresh data after successful transaction
      await fetchUserData();
    } catch (err: any) {
      console.error('Error returning tokens:', err);
      setError(`Failed to return tokens: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh the contract state
  const refreshContractState = async () => {
    if (!contractAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refreshing contract state...');
      
      // Force a UI update by toggling polling
      setIsPolling(true);
      setTimeout(() => setIsPolling(false), 1000);
      
      // Refresh data
      await fetchUserData();
      
      console.log('Contract state refreshed');
    } catch (err: any) {
      console.error('Error refreshing contract state:', err);
      setError(`Failed to refresh contract state: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add MetaMask authorization guide component
  const renderMetaMaskGuide = () => {
    if (!showMetaMaskGuide) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-4">MetaMask Authorization Required</h2>
          <p className="mb-4">
            MetaMask needs to be authorized to connect to your local development server.
            Follow these steps:
          </p>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Open MetaMask</li>
            <li>Click on the three dots menu (⋮) and select "Settings"</li>
            <li>Go to "Security & Privacy"</li>
            <li>Scroll down to "Connected Sites"</li>
            <li>Click "Add a site manually"</li>
            <li>Enter <code className="bg-gray-100 p-1 rounded">http://localhost:3000</code></li>
            <li>Click "Add"</li>
            <li>Refresh this page</li>
          </ol>
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you're deploying this DApp to a hosting service, 
              you'll need to authorize that domain instead of localhost.
            </p>
          </div>
          <button 
            onClick={() => setShowMetaMaskGuide(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            I've completed these steps
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      {renderMetaMaskGuide()}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Lottery DApp</h1>
          
          {/* Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <h2 className="font-bold">Wrong Network</h2>
              <p className="mt-2">You are not connected to the Sepolia testnet. Please switch networks:</p>
              <button 
                onClick={handleSwitchNetwork}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Switching...' : 'Switch to Sepolia'}
              </button>
            </div>
          )}
          
          {/* Wallet Connection */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
            
            {!isConnected ? (
              <div>
                <p className="mb-4">Connect your wallet to interact with the lottery:</p>
                <button
                  onClick={() => connect({ connector: injected({ target: 'metaMask', shimDisconnect: true }) })}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Connect Wallet
                </button>
                {connectError && (
                  <p className="mt-2 text-red-500">
                    Error: {connectError.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="mb-2">Connected: {address}</p>
                <p className="mb-4">Chain ID: {chainId}</p>
                
                <button
                  onClick={() => disconnect()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
          
          {!isLotteryValid && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p className="font-bold">Configuration Error:</p>
              <p>The lottery contract address is not set. Please update the LOTTERY_ADDRESS in config.ts</p>
            </div>
          )}
          
          {!isTokenValid && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p className="font-bold">Configuration Error:</p>
              <p>The lottery token contract address is not set. Please update the LOTTERY_TOKEN_ADDRESS in config.ts</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-bold mb-2">Lottery Status</h2>
                  <p>Bets Open: {isBetsOpen ? 'Yes' : 'No'}</p>
                  {isBetsOpen && betsClosingTime && (
                    <p>Closing Time: {new Date(Number(betsClosingTime) * 1000).toLocaleString()}</p>
                  )}
                  <p>Prize Pool: {prizePool ? formatEther(prizePool) : '0'} Tokens</p>
                  <p>Owner Pool: {ownerPool ? formatEther(ownerPool) : '0'} Tokens</p>
                  <p>Contract Owner: {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Loading...'}</p>
                  {address && owner && address !== owner && (
                    <p className="text-red-500 mt-2">You are not the contract owner. Only the owner can open bets.</p>
                  )}
                  <button 
                    onClick={refreshContractState}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh Contract State'}
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-bold mb-2">Your Account</h2>
                  <p>Token Balance: {loading ? 'Loading...' : userTokenBalance} Tokens</p>
                  <p>Prize: {loading ? 'Loading...' : userPrize} Tokens</p>
                  <div className="mt-2 flex items-center">
                    <p className="text-sm text-gray-500 mr-2">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                    <button 
                      onClick={fetchUserData}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Refresh'}
                    </button>
                    <button 
                      onClick={togglePolling}
                      className={`ml-2 py-1 px-2 rounded text-sm ${
                        isPolling 
                          ? 'bg-green-500 hover:bg-green-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {isPolling ? 'Auto-update: ON' : 'Auto-update: OFF'}
                    </button>
                  </div>
                </div>
                
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-bold mb-2">Admin Actions</h2>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                    <button 
                      onClick={handleOpenBets}
                      className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Open Bets'}
                    </button>
                  </div>
                  <button 
                    onClick={handleCloseBets}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Close Bets'}
                  </button>
                </div>
                
                <div className="mb-4 p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-bold mb-2">User Actions</h2>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Token Amount</label>
                    <input
                      type="number"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                    <button 
                      onClick={handleBuyTokens}
                      className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Buy Tokens'}
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                    <button 
                      onClick={handleBetMany}
                      className="mt-2 bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-sm"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Place Bets'}
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleClaimPrize}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Claim Prize'}
                  </button>
                  
                  <button 
                    onClick={handleWithdrawOwnerPool}
                    className="ml-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Withdraw Owner Pool'}
                  </button>
                  
                  <button 
                    onClick={handleReturnTokens}
                    className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Return Tokens'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Use dynamic import with ssr: false to avoid hydration errors
const LotteryAppWithNoSSR = dynamic(() => Promise.resolve(LotteryApp), { ssr: false });

export default function Home() {
  return <LotteryAppWithNoSSR />;
} 