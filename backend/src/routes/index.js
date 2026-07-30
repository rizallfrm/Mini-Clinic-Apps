const express = require('express');
const healthCheckRouter = require('./healthCheck');

const router = express.Router();

/**
 * Registrasi semua route API.
 * Route tambahan akan ditambahkan di sini setiap tahap.
 */

// Health check
router.use('/health', healthCheckRouter);

// Auth routes (Tahap 7)
// router.use('/auth', require('./auth'));

// Patient routes (Tahap 8)
// router.use('/patients', require('./patients'));

// Master data routes (Tahap 9)
// router.use('/doctors', require('./doctors'));
// router.use('/policlinics', require('./policlinics'));
// router.use('/medicines', require('./medicines'));

// Registration routes (Tahap 10)
// router.use('/registrations', require('./registrations'));

// Queue routes (Tahap 11)
// router.use('/queues', require('./queues'));

// Medical Record routes (Tahap 12)
// router.use('/medical-records', require('./medicalRecords'));

// Dashboard routes (Tahap 13)
// router.use('/dashboard', require('./dashboard'));

module.exports = router;
