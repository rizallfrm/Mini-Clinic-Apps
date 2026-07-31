'use strict';

const { Op } = require('sequelize');
const { Registration, Patient, Doctor, Policlinic, Payment, PrescriptionDetail, Medicine, sequelize } = require('../models');

const getVisitReport = async (startDate, endDate) => {
  const where = {};
  if (startDate && endDate) {
    where.visit_date = { [Op.between]: [startDate, endDate] };
  }

  const visits = await Registration.findAll({
    where,
    attributes: ['id', 'registration_number', 'visit_date', 'status', 'payment_type', 'created_at'],
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'medical_record_number'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'name'] },
      { model: Policlinic, as: 'policlinic', attributes: ['id', 'name'] },
      { model: Payment, as: 'payment', attributes: ['payment_status'] },
    ],
    order: [['visit_date', 'DESC']],
  });

  return visits;
};

const getRevenueReport = async (startDate, endDate) => {
  const where = { payment_status: 'PAID' };
  if (startDate && endDate) {
    where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
  }

  const payments = await Payment.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      { model: Registration, as: 'registration', attributes: ['id', 'registration_number'] },
    ],
    order: [['created_at', 'DESC']],
  });

  const totalRevenue = payments.reduce((acc, p) => acc + parseFloat(p.total_amount || 0), 0);

  return {
    totalRevenue,
    count: payments.length,
    items: payments,
  };
};

const getMedicineUsageReport = async (startDate, endDate) => {
  const usage = await PrescriptionDetail.findAll({
    attributes: [
      'medicine_id',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
      [sequelize.fn('COUNT', sequelize.col('PrescriptionDetail.id')), 'total_prescribed'],
    ],
    include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name', 'unit', 'price'] }],
    group: ['medicine_id', 'medicine.id', 'medicine.name', 'medicine.unit', 'medicine.price'],
    order: [[sequelize.literal('total_quantity'), 'DESC']],
  });

  return usage;
};

module.exports = {
  getVisitReport,
  getRevenueReport,
  getMedicineUsageReport,
};
