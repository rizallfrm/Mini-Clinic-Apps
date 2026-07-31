'use strict';

const paymentService = require('../services/paymentService');
const { sendSuccess, sendCreated } = require('../utils/response');

const getInvoice = async (req, res, next) => {
  try {
    const data = await paymentService.getInvoiceByRegistration(req.params.registrationId);
    return sendSuccess(res, 'Invoice fetched successfully', data);
  } catch (error) { next(error); }
};

const processPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.processPayment(req.params.registrationId, req.body);
    return sendCreated(res, 'Payment processed successfully', payment);
  } catch (error) { next(error); }
};

const getTodayPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getTodayPayments();
    return sendSuccess(res, 'Today payments fetched successfully', payments);
  } catch (error) { next(error); }
};

module.exports = {
  getInvoice,
  processPayment,
  getTodayPayments,
};
