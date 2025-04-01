export declare class AppService {
    publicClient: any;
    walletClient: any;
    constructor();
    getContractAddress(): string;
    getTokenName(): Promise<string>;
    getTokenSymbol(): Promise<string>;
    getTotalSupply(): Promise<string>;
    getTokenBalance(address: string): Promise<string>;
    getTransactionReceipt(hash: string): Promise<any>;
    getServerWalletAddress(): string;
    checkMinterRole(address: string): Promise<boolean>;
    mintTokens(address: string): Promise<{
        success: boolean;
        result: {
            message: string;
            address: any;
            hash: any;
        };
    }>;
}
