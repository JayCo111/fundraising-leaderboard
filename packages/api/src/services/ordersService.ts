// packages/api/src/services/ordersService.ts
import googleSheetsService from './googleSheetsService';
import { Validators } from '../utils/validators';
import { Helpers } from '../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ORDER_STATUS } from '../utils/constants';

export interface Order {
  Timestamp: string;
  OrderID: string;
  BuyerName: string;
  BuyerEmail: string;
  BuyerPhone: string;
  Quantity: number;
  TotalPaid: number;
  StudentID: string;
  Status: string;
}

export class OrdersService {
  /**
   * Get all orders
   */
  static async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await googleSheetsService.getOrders();
      return orders;
    } catch (error: any) {
      console.error('Error getting all orders:', error);
      throw new Error(`${ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
    }
  }

  /**
   * Get orders by student ID
   */
  static async getOrdersByStudentId(studentId: string): Promise<Order[]> {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const orders = await googleSheetsService.getOrdersByStudentId(studentId);
    return orders;
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(status: string): Promise<Order[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(o => o.Status === status);
  }

  /**
   * Add new order
   */
  static async addOrder(orderData: {
    BuyerName: string;
    BuyerEmail: string;
    BuyerPhone: string;
    Quantity: number;
    TotalPaid: number;
    StudentID: string;
    Status?: string;
  }): Promise<{ success: boolean; orderId: string; message: string }> {
    // Validate required fields
    const nameValidation = Validators.validateName(orderData.BuyerName, 'Buyer name');
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    const emailValidation = Validators.validateEmail(orderData.BuyerEmail);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const phoneValidation = Validators.validatePhone(orderData.BuyerPhone);
    if (!phoneValidation.valid) {
      throw new Error(phoneValidation.error);
    }

    const quantityValidation = Validators.validateQuantity(orderData.Quantity);
    if (!quantityValidation.valid) {
      throw new Error(quantityValidation.error);
    }

    const amountValidation = Validators.validateAmount(orderData.TotalPaid);
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }

    // Verify student exists
    const StudentsService = require('./studentsService').StudentsService;
    try {
      await StudentsService.getStudentById(orderData.StudentID);
    } catch {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    // Generate order ID
    const orderId = Helpers.generateId('ORD');

    // Add order to Google Sheets
    await googleSheetsService.addOrder({
      OrderID: orderId,
      BuyerName: nameValidation.sanitized!,
      BuyerEmail: emailValidation.sanitized!,
      BuyerPhone: phoneValidation.sanitized!,
      Quantity: orderData.Quantity,
      TotalPaid: orderData.TotalPaid,
      StudentID: orderData.StudentID,
      Status: orderData.Status || ORDER_STATUS.PAID,
    });

    console.log('✅ Order added successfully:', {
      orderId,
      studentId: orderData.StudentID,
      amount: Helpers.formatCurrency(orderData.TotalPaid * 100),
      quantity: orderData.Quantity,
    });

    return {
      success: true,
      orderId,
      message: SUCCESS_MESSAGES.ORDER_CREATED,
    };
  }

  /**
   * Get order statistics for a student
   */
  static async getStudentOrderStats(studentId: string): Promise<{
    totalOrders: number;
    totalCards: number;
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
    refundedOrders: number;
  }> {
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
      if (order.Status === ORDER_STATUS.PAID) {
        stats.paidOrders++;
        stats.totalCards += order.Quantity;
        stats.totalRevenue += order.TotalPaid;
      } else if (order.Status === ORDER_STATUS.PENDING) {
        stats.pendingOrders++;
      } else if (order.Status === ORDER_STATUS.REFUNDED) {
        stats.refundedOrders++;
      }
    }

    return stats;
  }

  /**
   * Get recent orders (last N days)
   */
  static async getRecentOrders(days: number = 7): Promise<Order[]> {
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
  static async getTopBuyers(limit: number = 10): Promise<{
    BuyerEmail: string;
    BuyerName: string;
    TotalOrders: number;
    TotalSpent: number;
    TotalCards: number;
  }[]> {
    const allOrders = await this.getAllOrders();
    const buyerMap = new Map<string, {
      BuyerEmail: string;
      BuyerName: string;
      TotalOrders: number;
      TotalSpent: number;
      TotalCards: number;
    }>();

    for (const order of allOrders) {
      if (order.Status !== ORDER_STATUS.PAID) continue;

      if (!buyerMap.has(order.BuyerEmail)) {
        buyerMap.set(order.BuyerEmail, {
          BuyerEmail: order.BuyerEmail,
          BuyerName: order.BuyerName,
          TotalOrders: 0,
          TotalSpent: 0,
          TotalCards: 0,
        });
      }

      const buyer = buyerMap.get(order.BuyerEmail)!;
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
  static async getOverallStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalCards: number;
    averageOrderValue: number;
    paidOrders: number;
    pendingOrders: number;
  }> {
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
      if (order.Status === ORDER_STATUS.PAID) {
        stats.paidOrders++;
        stats.totalRevenue += order.TotalPaid;
        stats.totalCards += order.Quantity;
        paidSum += order.TotalPaid;
        paidCount++;
      } else if (order.Status === ORDER_STATUS.PENDING) {
        stats.pendingOrders++;
      }
    }

    stats.averageOrderValue = paidCount > 0 ? paidSum / paidCount : 0;

    return stats;
  }
}
