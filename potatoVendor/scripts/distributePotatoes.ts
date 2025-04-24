import { parseEther, createWalletClient, createPublicClient, http, Address, isAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

import { abi } from '../potato-vendor/packages/hardhat/artifacts/contracts/PotatoToken.sol/Potato.json'

import * as dotenv from 'dotenv';
dotenv.config();

async function distributePotatoes() {
    const args = process.argv.slice(2);
    const amountArg = args[0];
    const receiverArg = args[1] as `0x${string}`
    console.log(`Going to distribute ${amountArg} pototoes to ${receiverArg}`);

    if(!isAddress(receiverArg)){
        console.log(`ERR: provided receiver argument '${receiverArg}' is not an address`);
        return;
    }

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
    })
    //console.log(process.env.MINTER_PRIVATE_KEY);
    const minterAccount = privateKeyToAccount(`0x${process.env.MINTER_PRIVATE_KEY}`);
    const minterClient = createWalletClient({
        account: minterAccount,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
    });

    //console.log(abi);
    const tokenAddress = process.env.POTATO_TOKEN_CONTRACT_ADDRESS
    console.log(`potato token contract address = ${tokenAddress}`);
    const data = await publicClient.readContract({
        address: tokenAddress as Address,
        abi,
        functionName: "balanceOf",
        args: [ receiverArg as Address ]
    });
    console.log(data);

    const hash = await minterClient.writeContract({
        address: tokenAddress as Address,
        abi,
        functionName: "mint",
        args: [ receiverArg as Address, parseEther(amountArg)]
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("minting completed");
}

distributePotatoes();