const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// Semua route dashboard wajib login
router.use(authenticate);

/**
 * GET /api/dashboard
 * Mengembalikan semua data sekaligus (metrics, trends, recent registrations).
 * Akses: Semua role bisa melihat dashboard.
 */
router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  dashboardController.getDashboardData
);

/**
 * GET /api/dashboard/metrics
 * Mengembalikan ringkasan metrik saja.
 */
router.get(
  '/metrics',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  dashboardController.getSummaryMetrics
);

/**
 * GET /api/dashboard/trends
 * Mengembalikan data tren kunjungan 7 hari terakhir saja.
 */
router.get(
  '/trends',
  authorize('ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'),
  dashboardController.getVisitTrends
);

module.exports = router;
