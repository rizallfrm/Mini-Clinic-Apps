'use strict';

const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

const getVisitReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getVisitReport(startDate, endDate);
    return sendSuccess(res, 'Visit report fetched successfully', data);
  } catch (error) { next(error); }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getRevenueReport(startDate, endDate);
    return sendSuccess(res, 'Revenue report fetched successfully', data);
  } catch (error) { next(error); }
};

const getMedicineUsageReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getMedicineUsageReport(startDate, endDate);
    return sendSuccess(res, 'Medicine usage report fetched successfully', data);
  } catch (error) { next(error); }
};

module.exports = {
  getVisitReport,
  getRevenueReport,
  getMedicineUsageReport,
};
