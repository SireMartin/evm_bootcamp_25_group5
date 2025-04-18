import { ethers } from 'ethers';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration
const RPC_URL: string = process.env.RPC_URL || 'http://localhost:8545';

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper to load deployment artifacts
function loadDeployment(contractName: string, network: string = 'localhost') {
    const deploymentPath = path.join(process.env.DEPLOYMENTS_PATH!, network, `${contractName}.json`);
    console.log(deploymentPath);
    if (!fs.existsSync(deploymentPath)) {
        throw new Error(`Deployment artifact not found for ${contractName} on ${network} at ${deploymentPath}`);
    }
    return JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
}

async function main(): Promise<void> {
    // Load deployment artifacts for the local network
    const network = 'localhost';                                                                // Change this to the appropriate network, e.g., mainnet or sepolia
    const potatoDeployment = loadDeployment('Potato', network);
    const vendorDeployment = loadDeployment('PotatoVendor', network);

    // Extract addresses and ABIs
    const POTATO_CONTRACT_ADDRESS = potatoDeployment.address;
    const VENDOR_CONTRACT_ADDRESS = vendorDeployment.address;
    const potatoABI = potatoDeployment.abi;
    const vendorABI = vendorDeployment.abi;

    if (!POTATO_CONTRACT_ADDRESS || !VENDOR_CONTRACT_ADDRESS) {
        console.error('Contract addresses are missing in the deployment artifacts');
        process.exit(1);
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

    // Create contract instances
    const potatoContract = new ethers.Contract(POTATO_CONTRACT_ADDRESS, potatoABI, provider);
    const vendorContract = new ethers.Contract(VENDOR_CONTRACT_ADDRESS, vendorABI, wallet);

    console.log('Daemon listening for events...');

    potatoContract.on('BuyPotato', async (buyer: string, email: string) => {
        console.log(`BuyPotato event received: Buyer=${buyer}, Email=${email}`);

        try {
            // Transfer tokens and assign locker
            const amount = ethers.parseUnits('1', 18);                                          // Example amount
            const transferTx = await vendorContract.transferApprovedTokens(buyer, amount);
            await transferTx.wait();

            const reserveLockerTx = await vendorContract.reserveLocker(buyer);
            await reserveLockerTx.wait();

            // Send confirmation email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Potato Order Confirmation',
                text: `Hello, your locker has been reserved. You can pick up your potatoes soon.`,
            });
            console.log('Email sent successfully!');
        } catch (error) {
            console.error('Error processing event:', error);
        }
    });
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});