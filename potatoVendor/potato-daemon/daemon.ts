import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = process.env.POTATO_CONTRACT_ABI ? JSON.parse(process.env.POTATO_CONTRACT_ABI) : [];

async function main() {
    if (!CONTRACT_ADDRESS || !CONTRACT_ABI) {
        console.error('Please set CONTRACT_ADDRESS and CONTRACT_ABI in your .env file');
        process.exit(1);
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    console.log('Starting daemon...');
    console.log(`Listening to events from contract: ${CONTRACT_ADDRESS}`);

    // Listen to all events
    contract.on('*', (event) => {
        console.log('Event received:', {
            name: event.eventName,
            args: event.args,
            blockNumber: event.blockNumber,
            transactionHash: event.log.transactionHash
        });
    });

    // Keep the process running
    process.on('SIGINT', () => {
        console.log('Shutting down daemon...');
        process.exit(0);
    });
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
}); 