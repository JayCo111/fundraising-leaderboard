"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRoutes = void 0;
// packages/api/src/routes/orders.ts
const express_1 = require("express");
const ordersService_1 = require("../services/ordersService");
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
exports.ordersRoutes = router;
/**
 * GET /api/v1/orders
 * Get all orders
 * Query params:
 * - status: filter by status
 * - studentId: filter by student ID
 * - days: get recent orders (last N days)
 */
router.get('/', async (req, res) => {
    try {
        const { status, studentId, days } = req.query;
        let orders;
        if (days) {
            orders = await ordersService_1.OrdersService.getRecentOrders(Number(days));
        }
        else if (studentId) {
            orders = await ordersService_1.OrdersService.getOrdersByStudentId(String(studentId));
        }
        else if (status) {
            orders = await ordersService_1.OrdersService.getOrdersByStatus(String(status));
        }
        else {
            orders = await ordersService_1.OrdersService.getAllOrders();
        }
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: orders,
            count: orders.length,
        });
    }
    catch (error) {
        console.error('Error in GET /orders:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * POST /api/v1/orders
 * Add new order
 */
router.post('/', async (req, res) => {
    try {
        const result = await ordersService_1.OrdersService.addOrder(req.body);
        res.status(constants_1.HTTP_STATUS.CREATED).json(result);
    }
    catch (error) {
        console.error('Error in POST /orders:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/orders/student/:studentId
 * Get orders for a specific student
 */
router.get('/student/:studentId', async (req, res) => {
    try {
        const orders = await ordersService_1.OrdersService.getOrdersByStudentId(req.params.studentId);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: orders,
            count: orders.length,
        });
    }
    catch (error) {
        console.error('Error in GET /orders/student/:studentId:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/orders/student/:studentId/stats
 * Get order statistics for a student
 */
router.get('/student/:studentId/stats', async (req, res) => {
    try {
        const stats = await ordersService_1.OrdersService.getStudentOrderStats(req.params.studentId);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error in GET /orders/student/:studentId/stats:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/orders/stats/overall
 * Get overall order statistics
 */
router.get('/stats/overall', async (req, res) => {
    try {
        const stats = await ordersService_1.OrdersService.getOverallStats();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error in GET /orders/stats/overall:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/orders/top-buyers
 * Get top buyers
 * Query params:
 * - limit: number of top buyers to return (default: 10)
 */
router.get('/top-buyers', async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const topBuyers = await ordersService_1.OrdersService.getTopBuyers(limit);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: topBuyers,
            count: topBuyers.length,
        });
    }
    catch (error) {
        console.error('Error in GET /orders/top-buyers:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
