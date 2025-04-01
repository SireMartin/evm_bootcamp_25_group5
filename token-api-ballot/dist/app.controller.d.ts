import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getContractAddress(): {
        result: string;
    };
    getTokenName(): Promise<{
        result: string;
    }>;
    getTokenSymbol(): Promise<{
        result: string;
    }>;
    getTotalSupply(): Promise<{
        result: string;
    }>;
    getTokenBalance(address: string): Promise<{
        result: string;
    }>;
    getTransactionReceipt(hash: string): Promise<{
        result: any;
    }>;
    getServerWalletAddress(): Promise<{
        result: string;
    }>;
    checkMinterRole(address: string): Promise<{
        result: boolean;
    }>;
    mintTokens(body: MintTokenDto): Promise<{
        result: {
            success: boolean;
            result: {
                message: string;
                address: any;
                hash: any;
            };
        };
    }>;
}
