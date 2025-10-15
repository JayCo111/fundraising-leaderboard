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
export declare class OrdersService {
    /**
     * Get all orders
     */
    static getAllOrders(): Promise<Order[]>;
    /**
     * Get orders by student ID
     */
    static getOrdersByStudentId(studentId: string): Promise<Order[]>;
    /**
     * Get orders by status
     */
    static getOrdersByStatus(status: string): Promise<Order[]>;
    /**
     * Add new order
     */
    static addOrder(orderData: {
        BuyerName: string;
        BuyerEmail: string;
        BuyerPhone: string;
        Quantity: number;
        TotalPaid: number;
        StudentID: string;
        Status?: string;
    }): Promise<{
        success: boolean;
        orderId: string;
        message: string;
    }>;
    /**
     * Get order statistics for a student
     */
    static getStudentOrderStats(studentId: string): Promise<{
        totalOrders: number;
        totalCards: number;
        totalRevenue: number;
        paidOrders: number;
        pendingOrders: number;
        refundedOrders: number;
    }>;
    /**
     * Get recent orders (last N days)
     */
    static getRecentOrders(days?: number): Promise<Order[]>;
    /**
     * Get top buyers
     */
    static getTopBuyers(limit?: number): Promise<{
        BuyerEmail: string;
        BuyerName: string;
        TotalOrders: number;
        TotalSpent: number;
        TotalCards: number;
    }[]>;
    /**
     * Get overall order statistics
     */
    static getOverallStats(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalCards: number;
        averageOrderValue: number;
        paidOrders: number;
        pendingOrders: number;
    }>;
}
//# sourceMappingURL=ordersService.d.ts.map