// packages/api/src/services/transactionService.ts
import { Pool } from 'pg';
import { config } from '../config';
import { Transaction } from '@sportsraiser/core/types';
import axios from 'axios';

export class TransactionService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async verifyPayPalWebhook(headers: any, body: any): Promise<boolean> {
    try {
      // PayPal webhook verification
      const paypalWebhookId = config.PAYPAL_WEBHOOK_ID;
      const paypalClientId = config.PAYPAL_CLIENT_ID;
      const paypalClientSecret = config.PAYPAL_CLIENT_SECRET;
      
      if (!paypalWebhookId || !paypalClientId || !paypalClientSecret) {
        console.warn('PayPal credentials not configured, skipping verification');
        return true; // Allow in development
      }

      // Verify webhook signature with PayPal API
      const verificationUrl = config.PAYPAL_MODE === 'live' 
        ? 'https://api.paypal.com/v1/notifications/verify-webhook-signature'
        : 'https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature';

      const authResponse = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`
          }
        }
      );

      const accessToken = authResponse.data.access_token;

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: paypalWebhookId,
        webhook_event: body
      };

      const verificationResponse = await axios.post(verificationUrl, verificationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return verificationResponse.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Error verifying PayPal webhook:', error);
      return false;
    }
  }

  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (
        campaign_id,
        seller_user_id,
        amount,
        quantity,
        sku,
        processor,
        external_txn_id,
        attributed_affiliate_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      transactionData.campaign_id,
      transactionData.seller_user_id,
      transactionData.amount,
      transactionData.quantity,
      transactionData.sku,
      transactionData.processor,
      transactionData.external_txn_id,
      transactionData.attributed_affiliate_id
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async handleRefund(refundData: any): Promise<void> {
    // Find the original transaction
    const findQuery = `
      SELECT * FROM transactions 
      WHERE external_txn_id = $1
    `;
    
    const findResult = await this.db.query(findQuery, [refundData.parent_payment]);
    
    if (findResult.rows.length === 0) {
      console.error(`Original transaction not found for refund: ${refundData.parent_payment}`);
      return;
    }

    const originalTransaction = findResult.rows[0];
    
    // Create a negative transaction for the refund
    const refundQuery = `
      INSERT INTO transactions (
        campaign_id,
        seller_user_id,
        amount,
        quantity,
        sku,
        processor,
        external_txn_id,
        attributed_affiliate_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const refundAmount = Math.round(refundData.amount.total * 100);
    const refundValues = [
      originalTransaction.campaign_id,
      originalTransaction.seller_user_id,
      -refundAmount, // Negative amount for refund
      originalTransaction.quantity,
      originalTransaction.sku,
      'paypal',
      refundData.id,
      originalTransaction.attributed_affiliate_id
    ];

    await this.db.query(refundQuery, refundValues);
    
    console.log(`Refund transaction created for original transaction: ${originalTransaction.id}`);
  }

  async getTransactionsBySeller(sellerUserId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const query = `
      SELECT * FROM transactions 
      WHERE seller_user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [sellerUserId, limit, offset]);
    return result.rows;
  }

  async getTransactionsByCampaign(campaignId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const query = `
      SELECT * FROM transactions 
      WHERE campaign_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [campaignId, limit, offset]);
    return result.rows;
  }

  async getTransactionStats(scopeType: string, scopeId: string): Promise<any> {
    let scopeCondition = '';
    let params: any[] = [];

    switch (scopeType) {
      case 'team':
        scopeCondition = `
          AND t.id = $1
        `;
        params = [scopeId];
        break;
      case 'program':
        scopeCondition = `
          AND t.program_id = $1
        `;
        params = [scopeId];
        break;
      case 'org':
        scopeCondition = `
          AND p.org_id = $1
        `;
        params = [scopeId];
        break;
      default:
        scopeCondition = '';
    }

    const query = `
      SELECT 
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COUNT(tr.id) as transaction_count,
        COUNT(DISTINCT tr.seller_user_id) as unique_sellers,
        AVG(tr.amount) as avg_transaction_amount,
        MIN(tr.created_at) as first_transaction,
        MAX(tr.created_at) as last_transaction
      FROM transactions tr
      JOIN campaigns c ON tr.campaign_id = c.id
      JOIN teams t ON c.scope_id = t.id AND c.scope_type = 'team'
      JOIN programs p ON t.program_id = p.id
      WHERE 1=1 ${scopeCondition}
    `;

    const result = await this.db.query(query, params);
    return result.rows[0];
  }
}
