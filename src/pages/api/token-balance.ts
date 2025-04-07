import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { LOTTERY_TOKEN_ABI } from '../../utils/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, tokenAddress, contractAddress } = req.query;

  if (!address || !tokenAddress || typeof address !== 'string' || typeof tokenAddress !== 'string') {
    console.error('Missing or invalid parameters:', { address, tokenAddress });
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  try {
    console.log('Fetching balance for:', { address, tokenAddress, contractAddress });
    
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const balance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: LOTTERY_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    console.log('Balance fetched:', balance.toString());
    return res.status(200).json({ balance: balance.toString() });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return res.status(500).json({ error: 'Failed to fetch token balance' });
  }
} 