import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';

@Controller()
export class AppController {
  
  constructor(private readonly appService: AppService) {}

  @Get('token-contract-address')
  getContractAddress(){
    return {result: this.appService.getTokenContractAddress()};
  }

  @Get('ballot-contract-address')
  getBallotAddress(){
    return {result: this.appService.getBallotContractAddress()};
  }

  @Get('token-name')
  async getTokenName() {
    return {result: await this.appService.getTokenName()};
  }

  @Get('token-symbol')
  async getTokenSymbol() {
    return {result: await this.appService.getTokenSymbol()};
  }

  @Get('token-total-supply')
  async getTotalSupply() {
    return {result: await this.appService.getTotalSupply()};
  }

  @Get('token-balance/:address')
  async getTokenBalance(@Param('address') address: string) {
    return {result: await this.appService.getTokenBalance(address)};
  }

  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string) {
    return {result: await this.appService.getTransactionReceipt(hash)};
  }

  @Get('server-wallet-address')
  async getServerWalletAddress() {
    return {result: this.appService.getServerWalletAddress()};
  }

  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string) {
    return {result: await this.appService.checkMinterRole(address)};
  }

//  @Post('mint-tokens')
//  async mintTokens(@Body() body: MintTokenDto) {
//    return {result: await this.appService.mintTokens(body.address)};

  // @Post('mint-tokens/:address/:amount')
  // async mintTokens(@Body() body: MintTokenDto, @Param('address') address: string, @Param('amount') amount: number) {
  //   return {result: await this.appService.mintTokens(address, amount)};
  // }

  @Post('mint-tokens/:address/:amount')
  async mintTokens(@Body() body: MintTokenDto, @Param('address') address: string, @Param('amount') amount: number) {
    return await this.appService.mintTokens(address, amount); // Directly return the service result
  }

  @Get('vote-list')
  async getVoteList() {
    return {result: await this.appService.getVoteList()};
  }

  // @Get('winner-name')
  // async getWinnerName() {
  //   return {result: await this.appService.getWinnerName()};
  // }

}
