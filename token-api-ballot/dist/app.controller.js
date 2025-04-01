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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const mintToken_dto_1 = require("./dtos/mintToken.dto");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getContractAddress() {
        return { result: this.appService.getContractAddress() };
    }
    async getTokenName() {
        return { result: await this.appService.getTokenName() };
    }
    async getTokenSymbol() {
        return { result: await this.appService.getTokenSymbol() };
    }
    async getTotalSupply() {
        return { result: await this.appService.getTotalSupply() };
    }
    async getTokenBalance(address) {
        return { result: await this.appService.getTokenBalance(address) };
    }
    async getTransactionReceipt(hash) {
        return { result: await this.appService.getTransactionReceipt(hash) };
    }
    async getServerWalletAddress() {
        return { result: this.appService.getServerWalletAddress() };
    }
    async checkMinterRole(address) {
        return { result: await this.appService.checkMinterRole(address) };
    }
    async mintTokens(body) {
        return { result: await this.appService.mintTokens(body.address) };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('contract-address'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getContractAddress", null);
__decorate([
    (0, common_1.Get)('token-name'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokenName", null);
__decorate([
    (0, common_1.Get)('token-symbol'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokenSymbol", null);
__decorate([
    (0, common_1.Get)('total-supply'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTotalSupply", null);
__decorate([
    (0, common_1.Get)('token-balance/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTokenBalance", null);
__decorate([
    (0, common_1.Get)('transaction-receipt'),
    __param(0, (0, common_1.Query)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getTransactionReceipt", null);
__decorate([
    (0, common_1.Get)('server-wallet-address'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getServerWalletAddress", null);
__decorate([
    (0, common_1.Get)('check-minter-role'),
    __param(0, (0, common_1.Query)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkMinterRole", null);
__decorate([
    (0, common_1.Post)('mint-tokens'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mintToken_dto_1.MintTokenDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "mintTokens", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map