"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const tokenJson = require("./assets/MyToken.json");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
let AppService = class AppService {
    publicClient;
    walletClient;
    constructor() {
        const account = (0, accounts_1.privateKeyToAccount)(`0x${process.env.PRIVATE_KEY}`);
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
        });
        this.walletClient = (0, viem_1.createWalletClient)({
            transport: (0, viem_1.http)(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
            chain: chains_1.sepolia,
            account: account,
        });
    }
    getContractAddress() {
        return process.env.TOKEN_ADDRESS;
    }
    async getTokenName() {
        const name = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "name"
        });
        return name;
    }
    async getTokenSymbol() {
        const symbol = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "symbol"
        });
        return symbol;
    }
    async getTotalSupply() {
        const totalSupplyBN = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "totalSupply"
        });
        const totalSupply = (0, viem_1.formatEther)(totalSupplyBN);
        return totalSupply;
    }
    async getTokenBalance(address) {
        const balance = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "balanceOf",
            args: [address],
        });
        const balanceFormatted = (0, viem_1.formatEther)(balance);
        return balanceFormatted;
    }
    async getTransactionReceipt(hash) {
        const receipt = await this.publicClient.getTransactionReceipt({
            hash: hash,
        });
        return receipt;
    }
    getServerWalletAddress() {
        return this.walletClient.account.address;
    }
    async checkMinterRole(address) {
        const MINTER_ROLE = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: "MINTER_ROLE"
        });
        const hasRole = await this.publicClient.readContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: 'hasRole',
            args: [MINTER_ROLE, address],
        });
        return hasRole;
    }
    async mintTokens(address) {
        const amount = (0, viem_1.parseEther)("5");
        const mintTx = await this.walletClient.writeContract({
            address: this.getContractAddress(),
            abi: tokenJson.abi,
            functionName: 'mint',
            args: [this.walletClient.account.address, amount],
        });
        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash: mintTx,
        });
        return {
            success: true,
            result: {
                message: 'Tokens minted successfully',
                address: this.walletClient.account.address,
                hash: receipt,
            }
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppService);
//# sourceMappingURL=app.service.js.map