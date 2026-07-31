'use strict';

const express = require('express');
const queueController = require('../controllers/queueController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();
router.use(authenticate);

router.get('/today', queueController.getTodayQueues);
router.patch('/:id/call', queueController.callQueue);
router.patch('/:id/start', queueController.startQueue);
router.patch('/:id/complete', queueController.completeQueue);
router.patch('/:id/skip', queueController.skipQueue);

module.exports = router;
