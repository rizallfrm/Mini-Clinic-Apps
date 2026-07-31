'use strict';

const express = require('express');
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
router.use(authenticate);

router.get('/today', paymentController.getTodayPayments);
router.get('/invoice/:registrationId', paymentController.getInvoice);
router.post('/process/:registrationId', paymentController.processPayment);

module.exports = router;
