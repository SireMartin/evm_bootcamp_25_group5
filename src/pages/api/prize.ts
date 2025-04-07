import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { LOTTERY_ABI } from '../../utils/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, contractAddress } = req.query;

  if (!address || !contractAddress || typeof address !== 'string' || typeof contractAddress !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const prize = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'prize',
      args: [address as `0x${string}`],
    });

    return res.status(200).json({ prize: prize.toString() });
  } catch (error) {
    console.error('Error fetching prize:', error);
    return res.status(500).json({ error: 'Failed to fetch prize' });
  }
} 