import { ethers, formatEther } from 'ethers';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import PotatoVendorArtifact from '../potato-vendor/packages/hardhat/artifacts/contracts/PotatoVendor.sol/PotatoVendor.json'
// Load environment variables
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POTATO_VENDOR_ADDRESS = process.env.POTATO_VENDOR_ADDRESS;

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Map to store buyer addresses and their corresponding emails/amounts for context
const buyerInfo: { [address: string]: { email: string, amount: bigint } } = {};

// --- Queue Implementation ---
interface EventQueueItem {
    eventName: string;
    data: any; // Consider defining specific types for each event data
}

const eventQueue: EventQueueItem[] = [];
let isProcessing = false;
// --------------------------

// --- Event Processing Logic ---
async function handleBuyPotato(data: { buyer: string, amount: bigint, email: string }, contract: ethers.Contract) {
    console.log('Processing BuyPotato event:', data);
    try {
        // Store buyer info for later use (e.g., emails)
        buyerInfo[data.buyer] = { email: data.email, amount: data.amount };

        // Call the potatoVendor contract to acquire the buyer tokens
        console.log(`Acquiring ${formatEther(data.amount)} potato tokens from buyer ${data.buyer} ...`);
        const txApproveAmount = await contract.getApprovedAmount(data.buyer, data.amount);
        console.log('getApprovedAmount Tx sent:', txApproveAmount.hash);
        await txApproveAmount.wait();
        console.log('getApprovedAmount Tx confirmed');

        // Call the potatoVendor contract to reserve a locker
        console.log(`Reserving locker for buyer ${data.buyer}...`);
        const txReserveLocker = await contract.reserveLocker(data.buyer);
        console.log('reserveLocker Tx sent:', txReserveLocker.hash);
        await txReserveLocker.wait();
        console.log('reserveLocker Tx confirmed');
    } catch (error) {
        console.error(`Error processing BuyPotato for ${data.buyer}:`, error);
    }
}

async function handleLockerAssigned(data: { buyer: string, lockerNumber: number }) {
    console.log('Processing LockerAssigned event:', data);
    const info = buyerInfo[data.buyer];
    if (!info) {
        console.error('No email/amount info found for buyer:', data.buyer);
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: info.email,
            subject: 'Potato Locker Reservation',
            text: `Hello, your locker has been reserved. \nThe ${formatEther(info.amount)} potatoes are awaiting you at locker ${data.lockerNumber}.`,
        });
        console.log(`Email LockerReservation sent successfully to ${info.email}`);
    } catch (error) {
        console.error(`Error sending LockerAssigned email to ${info.email}:`, error);
    }
}

async function handleLockerOpened(data: { buyer: string, lockerNumber: number }) {
    console.log('Processing LockerOpened event:', data);
    const info = buyerInfo[data.buyer];
    if (!info) {
        console.error('No email/amount info found for buyer:', data.buyer);
        return;
    }
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: info.email,
            subject: 'Potato Pickup',
            text: `Hello, your ${formatEther(info.amount)} potatoes at locker ${data.lockerNumber} have been picked up.`,
        });
        console.log(`Email PotatoPickup sent successfully to ${info.email}`);
    } catch (error) {
        console.error(`Error sending LockerOpened email to ${info.email}:`, error);
    }
}

async function processQueue(contract: ethers.Contract) {
    if (isProcessing) return; // Already processing
    if (eventQueue.length === 0) return; // Queue is empty

    isProcessing = true;
    console.log(`Processing queue. Items: ${eventQueue.length}`);

    while (eventQueue.length > 0) {
        const eventItem = eventQueue.shift(); // Get the oldest event
        if (!eventItem) continue;

        console.log(`Dequeued event: ${eventItem.eventName}`);

        try {
            switch (eventItem.eventName) {
                case 'BuyPotato':
                    await handleBuyPotato(eventItem.data, contract);
                    break;
                case 'LockerAssigned':
                    await handleLockerAssigned(eventItem.data);
                    break;
                case 'LockerOpened':
                    await handleLockerOpened(eventItem.data);
                    break;
                default:
                    console.warn(`Unknown event type in queue: ${eventItem.eventName}`);
            }
        } catch (error) {
            console.error(`Unhandled error during ${eventItem.eventName} processing:`, error);
        }
        console.log(`Finished processing: ${eventItem.eventName}`);
    }

    isProcessing = false;
    console.log('Queue processing finished.');
}
// ---------------------------------

async function main() {
    if (!POTATO_VENDOR_ADDRESS) {
        console.error('Please set POTATO_VENDOR_ADDRESS in your .env file');
        process.exit(1);
    }
    if (!PRIVATE_KEY) {
        console.error('Please set PRIVATE_KEY in your .env file');
        process.exit(1);
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Create contract instance with signer
    const vendorContract = new ethers.Contract(POTATO_VENDOR_ADDRESS, PotatoVendorArtifact.abi, wallet);

    console.log('Starting daemon...');
    console.log(`Listening to events from potatoVendor contract: ${POTATO_VENDOR_ADDRESS}`);
    console.log(`Using wallet address: ${wallet.address}`);

    // --- Setup Event Listeners --- 
    vendorContract.on('BuyPotato', (buyer, amount, email, event) => {
        console.log('Received BuyPotato event, adding to queue:', { buyer, amount: amount.toString(), email });
        eventQueue.push({ eventName: 'BuyPotato', data: { buyer, amount, email } });
        processQueue(vendorContract); // Trigger processing if idle
    });

    vendorContract.on('LockerAssigned', (buyer, lockerNumber, event) => {
        console.log('Received LockerAssigned event, adding to queue:', { buyer, lockerNumber });
        eventQueue.push({ eventName: 'LockerAssigned', data: { buyer, lockerNumber } });
        processQueue(vendorContract); // Trigger processing if idle
    });

    vendorContract.on('LockerOpened', (buyer, lockerNumber, event) => {
        console.log('Received LockerOpened event, adding to queue:', { buyer, lockerNumber });
        eventQueue.push({ eventName: 'LockerOpened', data: { buyer, lockerNumber } });
        processQueue(vendorContract); // Trigger processing if idle
    });
    // -----------------------------

    console.log('Daemon started and listening for events...');

    // Keep the process running
    process.on('SIGINT', () => {
        console.log('Shutting down daemon...');
        // Optionally wait for queue to finish?
        vendorContract.removeAllListeners(); // Clean up listeners
        process.exit(0);
    });
}

main().catch((error) => {
    console.error('Daemon crashed:', error);
    process.exit(1);
}); 