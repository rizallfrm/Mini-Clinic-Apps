'use strict';

const express = require('express');
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
router.use(authenticate);

router.get('/visits', reportController.getVisitReport);
router.get('/revenue', reportController.getRevenueReport);
router.get('/medicines', reportController.getMedicineUsageReport);

module.exports = router;
