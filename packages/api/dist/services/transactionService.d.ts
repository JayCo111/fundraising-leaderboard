import { Transaction } from '@sportsraiser/core/types';
export declare class TransactionService {
    private db;
    constructor();
    verifyPayPalWebhook(headers: any, body: any): Promise<boolean>;
    createTransaction(transactionData: Partial<Transaction>): Promise<Transaction>;
    handleRefund(refundData: any): Promise<void>;
    getTransactionsBySeller(sellerUserId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    getTransactionsByCampaign(campaignId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    getTransactionStats(scopeType: string, scopeId: string): Promise<any>;
}
//# sourceMappingURL=transactionService.d.ts.map