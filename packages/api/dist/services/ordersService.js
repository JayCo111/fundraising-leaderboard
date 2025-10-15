"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
// packages/api/src/services/ordersService.ts
const googleSheetsService_1 = __importDefault(require("./googleSheetsService"));
const validators_1 = require("../utils/validators");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
class OrdersService {
    /**
     * Get all orders
     */
    static async getAllOrders() {
        try {
            const orders = await googleSheetsService_1.default.getOrders();
            return orders;
        }
        catch (error) {
            console.error('Error getting all orders:', error);
            throw new Error(`${constants_1.ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
        }
    }
    /**
     * Get orders by student ID
     */
    static async getOrdersByStudentId(studentId) {
        if (!studentId) {
            throw new Error('Student ID is required');
        }
        const orders = await googleSheetsService_1.default.getOrdersByStudentId(studentId);
        return orders;
    }
    /**
     * Get orders by status
     */
    static async getOrdersByStatus(status) {
        const allOrders = await this.getAllOrders();
        return allOrders.filter(o => o.Status === status);
    }
    /**
     * Add new order
     */
    static async addOrder(orderData) {
        // Validate required fields
        const nameValidation = validators_1.Validators.validateName(orderData.BuyerName, 'Buyer name');
        if (!nameValidation.valid) {
            throw new Error(nameValidation.error);
        }
        const emailValidation = validators_1.Validators.validateEmail(orderData.BuyerEmail);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        const phoneValidation = validators_1.Validators.validatePhone(orderData.BuyerPhone);
        if (!phoneValidation.valid) {
            throw new Error(phoneValidation.error);
        }
        const quantityValidation = validators_1.Validators.validateQuantity(orderData.Quantity);
        if (!quantityValidation.valid) {
            throw new Error(quantityValidation.error);
        }
        const amountValidation = validators_1.Validators.validateAmount(orderData.TotalPaid);
        if (!amountValidation.valid) {
            throw new Error(amountValidation.error);
        }
        // Verify student exists
        const StudentsService = require('./studentsService').StudentsService;
        try {
            await StudentsService.getStudentById(orderData.StudentID);
        }
        catch {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        // Generate order ID
        const orderId = helpers_1.Helpers.generateId('ORD');
        // Add order to Google Sheets
        await googleSheetsService_1.default.addOrder({
            OrderID: orderId,
            BuyerName: nameValidation.sanitized,
            BuyerEmail: emailValidation.sanitized,
            BuyerPhone: phoneValidation.sanitized,
            Quantity: orderData.Quantity,
            TotalPaid: orderData.TotalPaid,
            StudentID: orderData.StudentID,
            Status: orderData.Status || constants_1.ORDER_STATUS.PAID,
        });
        console.log('✅ Order added successfully:', {
            orderId,
            studentId: orderData.StudentID,
            amount: helpers_1.Helpers.formatCurrency(orderData.TotalPaid * 100),
            quantity: orderData.Quantity,
        });
        return {
            success: true,
            orderId,
            message: constants_1.SUCCESS_MESSAGES.ORDER_CREATED,
        };
    }
    /**
     * Get order statistics for a student
     */
    static async getStudentOrderStats(studentId) {
        const orders = await this.getOrdersByStudentId(studentId);
        const stats = {
            totalOrders: orders.length,
            totalCards: 0,
            totalRevenue: 0,
            paidOrders: 0,
            pendingOrders: 0,
            refundedOrders: 0,
        };
        for (const order of orders) {
            if (order.Status === constants_1.ORDER_STATUS.PAID) {
                stats.paidOrders++;
                stats.totalCards += order.Quantity;
                stats.totalRevenue += order.TotalPaid;
            }
            else if (order.Status === constants_1.ORDER_STATUS.PENDING) {
                stats.pendingOrders++;
            }
            else if (order.Status === constants_1.ORDER_STATUS.REFUNDED) {
                stats.refundedOrders++;
            }
        }
        return stats;
    }
    /**
     * Get recent orders (last N days)
     */
    static async getRecentOrders(days = 7) {
        const allOrders = await this.getAllOrders();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return allOrders.filter(order => {
            const orderDate = new Date(order.Timestamp);
            return orderDate >= cutoffDate;
        });
    }
    /**
     * Get top buyers
     */
    static async getTopBuyers(limit = 10) {
        const allOrders = await this.getAllOrders();
        const buyerMap = new Map();
        for (const order of allOrders) {
            if (order.Status !== constants_1.ORDER_STATUS.PAID)
                continue;
            if (!buyerMap.has(order.BuyerEmail)) {
                buyerMap.set(order.BuyerEmail, {
                    BuyerEmail: order.BuyerEmail,
                    BuyerName: order.BuyerName,
                    TotalOrders: 0,
                    TotalSpent: 0,
                    TotalCards: 0,
                });
            }
            const buyer = buyerMap.get(order.BuyerEmail);
            buyer.TotalOrders++;
            buyer.TotalSpent += order.TotalPaid;
            buyer.TotalCards += order.Quantity;
        }
        const buyers = Array.from(buyerMap.values());
        buyers.sort((a, b) => b.TotalSpent - a.TotalSpent);
        return buyers.slice(0, limit);
    }
    /**
     * Get overall order statistics
     */
    static async getOverallStats() {
        const allOrders = await this.getAllOrders();
        const stats = {
            totalOrders: allOrders.length,
            totalRevenue: 0,
            totalCards: 0,
            averageOrderValue: 0,
            paidOrders: 0,
            pendingOrders: 0,
        };
        let paidSum = 0;
        let paidCount = 0;
        for (const order of allOrders) {
            if (order.Status === constants_1.ORDER_STATUS.PAID) {
                stats.paidOrders++;
                stats.totalRevenue += order.TotalPaid;
                stats.totalCards += order.Quantity;
                paidSum += order.TotalPaid;
                paidCount++;
            }
            else if (order.Status === constants_1.ORDER_STATUS.PENDING) {
                stats.pendingOrders++;
            }
        }
        stats.averageOrderValue = paidCount > 0 ? paidSum / paidCount : 0;
        return stats;
    }
}
exports.OrdersService = OrdersService;
