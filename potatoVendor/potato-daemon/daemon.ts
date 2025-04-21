import { ethers } from 'ethers';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
// Load environment variables
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POTATO_VENDOR_ADDRESS = process.env.POTATO_VENDOR_ADDRESS;
const POTATO_VENDOR_ABI = process.env.POTATO_VENDOR_ABI ? JSON.parse(process.env.POTATO_VENDOR_ABI) : [];

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Map to store buyer addresses and their corresponding emails
const buyerEmails: { [address: string]: string } = {};


async function main() {
    if (!POTATO_VENDOR_ADDRESS || !POTATO_VENDOR_ABI) {
        console.error('Please set POTATO_VENDOR_ADDRESS and POTATO_VENDOR_ABI in your .env file');
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
    const vendorContract = new ethers.Contract(POTATO_VENDOR_ADDRESS, POTATO_VENDOR_ABI, wallet);

    console.log('Starting daemon...');
    console.log(`Listening to events from contract: ${POTATO_VENDOR_ADDRESS}`);
    console.log(`Using wallet address: ${wallet.address}`);

    // Listen to all events
    vendorContract.on('*', async (event) => {
        console.log('Token event received:', {
            name: event.eventName,
            args: event.args,
            blockNumber: event.blockNumber,
            transactionHash: event.log.transactionHash
        });

        if (event.eventName === 'BuyPotato') {
            try {
                //call the potatoVendor contract to acquire the buyer tokens to it
                console.log('Acquiring buyer tokens...');
                const txApproveAmount = await vendorContract.getApprovedAmount(event.args.buyer, event.args.amount);
                console.log('Transaction sent:', txApproveAmount.hash);
                await txApproveAmount.wait();
                console.log('Transaction confirmed');

                //call the potatoVendor contract to reserve a locker
                console.log('Reserving locker...');
                const txReserveLocker = await vendorContract.reserveLocker(event.args.buyer);
                const receipt = await txReserveLocker.wait();
                console.log('Transaction confirmed');

                // Store the buyer's email in the map
                buyerEmails[event.args.buyer] = event.args.email;

                //get the return value of the reserveLocker function
                const result = await provider.call({
                    to: POTATO_VENDOR_ADDRESS,
                    data: txReserveLocker.data
                });
                console.log('Reserved locker:', ethers.toNumber(result));

                // Get the last locker number from the contract
                const lastLockerNumber = await vendorContract._lastLockerNumber();
                console.log('Last locker number from contract:', ethers.toNumber((lastLockerNumber)));
            } catch (error) {
                console.error('Error sending transaction:', error);
            }
        }
        else if (event.eventName === 'LockerAssigned') {
            if (!buyerEmails[event.args.buyer]) {
                console.error('No email found for buyer:', event.args.buyer);
                return;
            }
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: buyerEmails[event.args.buyer],
                subject: 'Potato Locker Reservation',
                text: `Hello, your locker has been reserved. \nThe potatos are awaiting you at the locker ${event.args.lockerNumber}.`,
            });
            console.log(`Email LockerReservation sent successfully to ${buyerEmails[event.args.buyer]}`);
        }
        else if (event.eventName === 'LockerOpened') {
            if (!buyerEmails[event.args.buyer]) {
                console.error('No email found for buyer:', event.args.buyer);
                return;
            }
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: buyerEmails[event.args.buyer],
                subject: 'Potato Pickup',
                text: `Hello, your potatoes at locker ${event.args.lockerNumber} have been picked up.`,
            });
            console.log(`Email PotatoPickup sent successfully to ${buyerEmails[event.args.buyer]}`);
        }
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