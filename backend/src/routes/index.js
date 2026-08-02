const express = require('express');
const healthCheckRouter = require('./healthCheck');
const authRouter = require('./auth');
const patientRouter = require('./patients');
const policlinicRouter = require('./policlinics');
const doctorRouter = require('./doctors');
const medicineRouter = require('./medicines');
const registrationRouter = require('./registrations');
const medicalRecordRouter = require('./medicalRecords');
const dashboardRouter = require('./dashboard');

const prescriptionRouter = require('./prescriptions');

const queueRouter = require('./queues');
const userRouter = require('./users');
const paymentRouter = require('./payments');
const reportRouter = require('./reports');

const router = express.Router();

/**
 * Registrasi semua route API.
 */

// Health check
router.use('/health', healthCheckRouter);

// Auth routes
router.use('/auth', authRouter);

// User routes (Admin CRUD)
router.use('/users', userRouter);

// Patient routes
router.use('/patients', patientRouter);

// Master data routes
router.use('/policlinics', policlinicRouter);
router.use('/doctors', doctorRouter);
router.use('/medicines', medicineRouter);

// Registration routes
router.use('/registrations', registrationRouter);

// Queue routes
router.use('/queues', queueRouter);

// Payment & Billing routes
router.use('/payments', paymentRouter);

// Report & Analytics routes
router.use('/reports', reportRouter);

// Medical Record routes
router.use('/medical-records', medicalRecordRouter);
router.use('/prescriptions', prescriptionRouter);

// Dashboard routes
router.use('/dashboard', dashboardRouter);

module.exports = router;
