"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = void 0;
// packages/api/src/routes/webhooks.ts
const express_1 = require("express");
const transactionService_1 = require("../services/transactionService");
const leaderboardWorker_1 = require("../workers/leaderboardWorker");
const router = (0, express_1.Router)();
exports.webhookRoutes = router;
const transactionService = new transactionService_1.TransactionService();
const leaderboardWorker = new leaderboardWorker_1.LeaderboardWorker();
// POST /api/v1/webhooks/paypal
router.post('/paypal', async (req, res) => {
    try {
        const webhookData = req.body;
        // Verify PayPal webhook signature
        const isValid = await transactionService.verifyPayPalWebhook(req.headers, webhookData);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid webhook signature',
                message: 'PayPal webhook signature verification failed'
            });
        }
        // Process the webhook based on event type
        switch (webhookData.event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                await handlePaymentCompleted(webhookData);
                break;
            case 'PAYMENT.SALE.REFUNDED':
                await handlePaymentRefunded(webhookData);
                break;
            default:
                console.log(`Unhandled PayPal webhook event: ${webhookData.event_type}`);
        }
        const response = {
            success: true,
            message: 'Webhook processed successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error processing PayPal webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to process webhook'
        });
    }
});
async function handlePaymentCompleted(webhookData) {
    try {
        const paymentData = webhookData.resource;
        // Extract seller information from custom fields or return URL
        const sellerUserId = extractSellerFromPayment(paymentData);
        const campaignId = extractCampaignFromPayment(paymentData);
        if (!sellerUserId || !campaignId) {
            console.error('Missing seller or campaign information in payment');
            return;
        }
        // Create transaction record
        const transaction = await transactionService.createTransaction({
            campaign_id: campaignId,
            seller_user_id: sellerUserId,
            amount: Math.round(paymentData.amount.total * 100), // Convert to cents
            quantity: parseInt(paymentData.custom || '1'),
            sku: paymentData.item_list?.items?.[0]?.sku,
            processor: 'paypal',
            external_txn_id: paymentData.id,
            attributed_affiliate_id: sellerUserId
        });
        // Emit event for leaderboard updates
        await leaderboardWorker.processTransactionEvent(transaction);
        console.log(`Transaction created: ${transaction.id} for seller: ${sellerUserId}`);
    }
    catch (error) {
        console.error('Error handling payment completed:', error);
        throw error;
    }
}
async function handlePaymentRefunded(webhookData) {
    try {
        const refundData = webhookData.resource;
        // Find and update the original transaction
        await transactionService.handleRefund(refundData);
        console.log(`Refund processed for transaction: ${refundData.parent_payment}`);
    }
    catch (error) {
        console.error('Error handling payment refunded:', error);
        throw error;
    }
}
function extractSellerFromPayment(paymentData) {
    // Extract seller ID from custom fields, return URL, or other PayPal data
    // This would depend on how the seller link is constructed
    // Example: if seller link contains ?aff_id=user123
    const returnUrl = paymentData.redirect_urls?.return_url;
    if (returnUrl) {
        const url = new URL(returnUrl);
        return url.searchParams.get('aff_id');
    }
    // Or from custom field
    if (paymentData.custom) {
        try {
            const customData = JSON.parse(paymentData.custom);
            return customData.seller_id;
        }
        catch (e) {
            // custom might be just the seller ID
            return paymentData.custom;
        }
    }
    return null;
}
function extractCampaignFromPayment(paymentData) {
    // Extract campaign ID from custom fields or return URL
    const returnUrl = paymentData.redirect_urls?.return_url;
    if (returnUrl) {
        const url = new URL(returnUrl);
        return url.searchParams.get('campaign_id');
    }
    if (paymentData.custom) {
        try {
            const customData = JSON.parse(paymentData.custom);
            return customData.campaign_id;
        }
        catch (e) {
            return null;
        }
    }
    return null;
}
//# sourceMappingURL=webhooks.js.map