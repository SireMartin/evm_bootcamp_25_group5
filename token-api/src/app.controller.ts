import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { get } from 'http';
import { Address, ChainDisconnectedError, createPublicClient } from 'viem';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("contract-address")
  getContractAddress() {
    return { result: this.appService.getContractAddress()};
  }

  @Get("token-name")
  async getTokenName() {
    return { result: await this.appService.getTokenName()};
  }

  @Get("total-supply")
  async getTotalSupply(){
    return {result: await this.appService.getTotalSupply()};
  }

  @Get("token-balance/:address")
  async getTokenBalance(@Param("address") address: string){
    return { result: await this.appService.getTokenBalance(address as Address)};
  }

  @Get("transaction-receipt")
  async getTransacctionReceipt(@Query("hash") hash: string){
    return { blockNumber: Number(await this.appService.getTransactionReceipt(hash))};
  }

  @Get("server-wallet-address")
  getServerWalletAddress(){
    return { serverWalletAddress: this.appService.getServerWalletAddress()}
  }

  @Get("check-minter-role/:address")
  async checkMinterRole(@Param("address") address: Address){
    return { minterRole: await this.appService.checkMinterRole(address)};
  }
}
