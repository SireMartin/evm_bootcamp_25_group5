import { Injectable } from '@nestjs/common';
import * as tokenJson from "./assets/MyToken.json";
import * as ballotJson from "./assets/TokenizedBallot.json";
import { createPublicClient, http, Address, formatEther, createWalletClient, toHex, hexToString, parseEther } from 'viem';
import { hardhat, sepolia } from 'viem/chains'
import { privateKeyToAccount, toAccount } from 'viem/accounts';

@Injectable()
export class AppService {

  publicClient;
  walletClient;

  //constructor(private configService: ConfigService) {
    constructor() {

    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

    // Creating the Public Client
    this.publicClient = createPublicClient({
      // chain: hardhat,
      // transport: http(),
      chain: sepolia,
    //  transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
    });

    // Creating the Wallet Client
    this.walletClient = createWalletClient({
      account: account,
      // chain: hardhat,
      // transport: http(),
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
    });

  }

  getTokenContractAddress(): string {
    return process.env.TOKEN_ADDRESS as string;
  }

  getBallotContractAddress(): string {
    return process.env.BALLOT_ADDRESS as string;
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getTokenContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "name"
    });
    return name as string;
  }

  async getTokenSymbol(): Promise<string> {
    const symbol = await this.publicClient.readContract({
      address: this.getTokenContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "symbol"
    });
    return symbol as string;
  }

  async getTotalSupply() {
    const totalSupplyBN = await this.publicClient.readContract({
      address: this.getTokenContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "totalSupply"
    });
    const totalSupply = formatEther(totalSupplyBN as bigint);
    return totalSupply;
  }

  async getTokenBalance(address: string) {
    const balance = await this.publicClient.readContract({
      address: this.getTokenContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "balanceOf",
      args: [address as Address],
    });
    const balanceFormatted = formatEther(balance as bigint);
    return balanceFormatted;
  }

  async getTransactionReceipt(hash: string) {
    const receipt = await this.publicClient.getTransactionReceipt({
      hash: hash as Address,
    });
    return receipt;
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;                                 // is the deployer account, specified with the PRIVATE_KEY value in the .env file
  }

  async checkMinterRole(address: string): Promise<boolean> {
//    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getTokenContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "MINTER_ROLE"
    });
    const hasRole = await this.publicClient.readContract({
      address: this.getTokenContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  // async mintTokens(address: string) {
 async mintTokens(address: string, amount: number) {
    // const amount = parseEther("5");
    const mintTx = await this.walletClient.writeContract({
      address: this.getTokenContractAddress() as Address,
      amount: amount as Number,
      abi: tokenJson.abi,
      functionName: 'mint',
//      args: [this.walletClient.account.address, amount],
      args: [address, amount],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({       // need to wait until the tx is pending
      hash: mintTx as Address,
    });
    return { 
      success: true,
      result: {
        message: 'Tokens minted successfully!',
        address: this.walletClient.account.address,
        hash: receipt.transactionHash,
      }
    };
  }

  async getVoteList() {
    const logs = await this.publicClient.getContractEvents({
      address: this.getBallotContractAddress() as Address,
      abi: ballotJson.abi,
      eventName: 'Vote',
      fromBlock: BigInt(0),                                                   // Fetch events from the beginning of the blockchain
      toBlock: 'latest',                                                      // Up to the latest block
    });
    // Map the logs to extract specific fields from the event
    const voteList = logs.map((log) => {
      return {
        voter: log.args?.sender,
        proposal: log.args?._proposal,
        amount: log.args?._amount,
      };
    });
    return voteList;
  }

  // async getWinnerName(): Promise<string> {
  //   const winner = await this.publicClient.readContract({
  //     address: this.getBallotContractAddress() as Address,
  //     abi: ballotJson.abi,
  //     functionName: "winnerName"
  //   });
  //   return hexToString(winner, { size: 32 });
  // }

}
