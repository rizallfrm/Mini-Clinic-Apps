const express = require('express');
const { sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint untuk memverifikasi server dan database berjalan.
 */
router.get('/', async (req, res) => {
  try {
    // Tes koneksi database dengan query sederhana
    await sequelize.authenticate();

    // Ambil versi PostgreSQL
    const [results] = await sequelize.query('SELECT version()');
    const dbVersion = results[0]?.version?.split(' ').slice(0, 2).join(' ') || 'Unknown';

    return sendSuccess(res, 'Server is running', {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'Connected',
        version: dbVersion,
      },
      api: {
        version: '1.0.0',
        name: 'Mini Clinic Information System API',
      },
    });
  } catch (error) {
    console.error('Health check database error:', error.message);
    return sendError(
      res,
      'Server is running but database connection failed',
      503,
      { database: 'Disconnected' }
    );
  }
});

module.exports = router;
