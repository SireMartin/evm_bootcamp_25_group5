import { Get, Injectable } from '@nestjs/common';
import { Account, Address, createPublicClient, createWalletClient, formatEther, Hex, http, PublicClient, WalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import * as tokenJson from './assets/MyToken.json';
import { ConfigService } from '@nestjs/config';
import { addListener } from 'process';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class AppService {
  publicClient: PublicClient;
  walletClient: WalletClient;
  localAccount: Account;

  constructor(private configService: ConfigService){
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>("RPC_ENDPOINT_URL"))
    });
    this.walletClient = createWalletClient({
      chain: sepolia,
      transport: http(this.configService.get<string>("RPC_ENDPOINT_URL"))
    });
    this.localAccount = privateKeyToAccount(`0x${configService.get<string>("PRIVATE_KEY")}`)
    //console.log(`local address = ${this.localAccount.address}`)
  }

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): string {
    return this.configService.get<string>("TOKEN_ADDRESS") as string;
  }

  async getTokenName(): Promise<string>{
    const tokenName = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "name"
    });
    return tokenName as string;
  }

  async getTotalSupply(): Promise<string>{
    const totalSupply = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "totalSupply"
    });
    return formatEther(totalSupply as bigint);
  }

  async getTokenBalance(address: Address): Promise<string>{
    const tokenBalance = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "balanceOf",
      args: [ address as Address]
    });
    return formatEther(tokenBalance as bigint);
  }

  async getTransactionReceipt(hash: string): Promise<bigint>{
    const transactionReceipt = await this.publicClient.getTransactionReceipt({
      hash: hash as '0x${string}'
    });
    return transactionReceipt.blockNumber;
  }

  getServerWalletAddress(): Address {
    return this.localAccount.address;
  }

  async checkMinterRole(address: Address){
    console.log(`address: ${address}`)
    const minterRole = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "MINTER_ROLE"
    });
    console.log(`Minter role = ${minterRole}`)
    const hasMinterRole = await this.publicClient.readContract({
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "hasRole",
      args: [minterRole, address]
    });
    return hasMinterRole;
  }
}
