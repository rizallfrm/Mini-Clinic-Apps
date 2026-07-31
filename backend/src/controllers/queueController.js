'use strict';

const queueService = require('../services/queueService');
const { sendSuccess } = require('../utils/response');

const getTodayQueues = async (req, res, next) => {
  try {
    const queues = await queueService.getTodayQueues(req.query.policlinic_id);
    return sendSuccess(res, 'Today queues fetched successfully', queues);
  } catch (error) { next(error); }
};

const callQueue = async (req, res, next) => {
  try {
    const queue = await queueService.callQueue(req.params.id);
    return sendSuccess(res, 'Queue called successfully', queue);
  } catch (error) { next(error); }
};

const startQueue = async (req, res, next) => {
  try {
    const queue = await queueService.startQueue(req.params.id);
    return sendSuccess(res, 'Queue examination started successfully', queue);
  } catch (error) { next(error); }
};

const completeQueue = async (req, res, next) => {
  try {
    const queue = await queueService.completeQueue(req.params.id);
    return sendSuccess(res, 'Queue completed successfully', queue);
  } catch (error) { next(error); }
};

const skipQueue = async (req, res, next) => {
  try {
    const queue = await queueService.skipQueue(req.params.id);
    return sendSuccess(res, 'Queue skipped successfully', queue);
  } catch (error) { next(error); }
};

module.exports = {
  getTodayQueues,
  callQueue,
  startQueue,
  completeQueue,
  skipQueue,
};
