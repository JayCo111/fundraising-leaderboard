// packages/api/src/routes/orders.ts
import { Router, Request, Response } from 'express';
import { OrdersService } from '../services/ordersService';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

const router = Router();

/**
 * GET /api/v1/orders
 * Get all orders
 * Query params:
 * - status: filter by status
 * - studentId: filter by student ID
 * - days: get recent orders (last N days)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, studentId, days } = req.query;

    let orders;

    if (days) {
      orders = await OrdersService.getRecentOrders(Number(days));
    } else if (studentId) {
      orders = await OrdersService.getOrdersByStudentId(String(studentId));
    } else if (status) {
      orders = await OrdersService.getOrdersByStatus(String(status));
    } else {
      orders = await OrdersService.getAllOrders();
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error in GET /orders:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * POST /api/v1/orders
 * Add new order
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await OrdersService.addOrder(req.body);

    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error: any) {
    console.error('Error in POST /orders:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/orders/student/:studentId
 * Get orders for a specific student
 */
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const orders = await OrdersService.getOrdersByStudentId(req.params.studentId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error in GET /orders/student/:studentId:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/orders/student/:studentId/stats
 * Get order statistics for a student
 */
router.get('/student/:studentId/stats', async (req: Request, res: Response) => {
  try {
    const stats = await OrdersService.getStudentOrderStats(req.params.studentId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in GET /orders/student/:studentId/stats:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/orders/stats/overall
 * Get overall order statistics
 */
router.get('/stats/overall', async (req: Request, res: Response) => {
  try {
    const stats = await OrdersService.getOverallStats();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in GET /orders/stats/overall:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/orders/top-buyers
 * Get top buyers
 * Query params:
 * - limit: number of top buyers to return (default: 10)
 */
router.get('/top-buyers', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topBuyers = await OrdersService.getTopBuyers(limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: topBuyers,
      count: topBuyers.length,
    });
  } catch (error: any) {
    console.error('Error in GET /orders/top-buyers:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

export { router as ordersRoutes };
