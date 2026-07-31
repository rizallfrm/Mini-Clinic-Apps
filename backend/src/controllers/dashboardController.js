const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/dashboard
 * Mengambil semua data dashboard sekaligus (metrics, trends, recent).
 */
const getDashboardData = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData(req.user);
    return sendSuccess(res, 'Dashboard data retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/metrics
 * Hanya mengambil summary metrics.
 */
const getSummaryMetrics = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummaryMetrics(req.user);
    return sendSuccess(res, 'Summary metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/trends
 * Hanya mengambil data tren kunjungan.
 */
const getVisitTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getVisitTrends(req.user);
    return sendSuccess(res, 'Visit trends retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getSummaryMetrics,
  getVisitTrends,
};
