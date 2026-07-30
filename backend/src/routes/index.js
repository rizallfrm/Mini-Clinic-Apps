const express = require('express');
const healthCheckRouter = require('./healthCheck');
const authRouter = require('./auth');
const patientRouter = require('./patients');
const policlinicRouter = require('./policlinics');
const doctorRouter = require('./doctors');
const medicineRouter = require('./medicines');

const router = express.Router();

/**
 * Registrasi semua route API.
 */

// Health check
router.use('/health', healthCheckRouter);

// Auth routes (Tahap 7) ✅
router.use('/auth', authRouter);

// Patient routes (Tahap 8) ✅
router.use('/patients', patientRouter);

// Master data routes (Tahap 9) ✅
router.use('/policlinics', policlinicRouter);
router.use('/doctors', doctorRouter);
router.use('/medicines', medicineRouter);

// Registration routes (Tahap 10)
// router.use('/registrations', require('./registrations'));

// Queue routes (Tahap 11)
// router.use('/queues', require('./queues'));

// Medical Record routes (Tahap 12)
// router.use('/medical-records', require('./medicalRecords'));

// Dashboard routes (Tahap 13)
// router.use('/dashboard', require('./dashboard'));

module.exports = router;
