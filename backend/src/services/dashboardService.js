'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  Patient,
  Doctor,
  Medicine,
  Registration,
  Queue,
  Policlinic,
  Payment,
} = require('../models');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Mengambil ringkasan statistik (Summary Metrics).
 * Berguna untuk menampilkan widget angka di atas dashboard.
 */
const getSummaryMetrics = async (requestUser) => {
  const today = new Date().toISOString().split('T')[0];

  let doctorFilter = {};
  if (requestUser && requestUser.role === 'DOCTOR' && requestUser.doctorProfile) {
    doctorFilter = { doctor_id: requestUser.doctorProfile.id };
  }

  const [
    totalPatients,
    activeDoctors,
    lowStockMedicines,
    todayRegistrations,
    todayCompletedRegistrations,
  ] = await Promise.all([
    // Total Pasien
    Patient.count(),

    // Total Dokter Aktif
    Doctor.count({ where: { is_active: true } }),

    // Obat dengan stok menipis (< 20)
    Medicine.count({
      where: {
        is_active: true,
        stock: { [Op.lt]: 20 },
      },
    }),

    // Total pendaftaran hari ini (filtered for doctor if applicable)
    Registration.count({ where: { visit_date: today, ...doctorFilter } }),

    // Pendaftaran selesai hari ini (filtered for doctor if applicable)
    Registration.count({
      where: {
        visit_date: today,
        status: 'COMPLETED',
        ...doctorFilter,
      },
    }),
  ]);

  return {
    total_patients: totalPatients,
    active_doctors: activeDoctors,
    low_stock_medicines: lowStockMedicines,
    today_registrations: {
      total: todayRegistrations,
      completed: todayCompletedRegistrations,
      pending: todayRegistrations - todayCompletedRegistrations,
    },
  };
};

/**
 * Mengambil tren kunjungan pasien (7 hari terakhir).
 * Berguna untuk grafik/chart.
 */
const getVisitTrends = async (requestUser) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6); // 7 hari (hari ini + 6 hari ke belakang)

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  let doctorFilter = {};
  if (requestUser && requestUser.role === 'DOCTOR' && requestUser.doctorProfile) {
    doctorFilter = { doctor_id: requestUser.doctorProfile.id };
  }

  // Mengelompokkan pendaftaran berdasarkan visit_date
  const trends = await Registration.findAll({
    attributes: [
      'visit_date',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_visits'],
    ],
    where: {
      visit_date: {
        [Op.between]: [startDateStr, endDateStr],
      },
      status: {
        [Op.ne]: 'CANCELLED', // Abaikan yang dibatalkan
      },
      ...doctorFilter,
    },
    group: ['visit_date'],
    order: [['visit_date', 'ASC']],
  });

  // Konversi hasil query ke dictionary untuk mempermudah mapping
  const trendDict = {};
  trends.forEach((t) => {
    trendDict[t.visit_date] = parseInt(t.getDataValue('total_visits'), 10);
  });

  // Buat array lengkap 7 hari terakhir (walaupun 0 kunjungan)
  const result = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      visits: trendDict[dateStr] || 0,
    });
  }

  return result;
};

/**
 * Mengambil daftar pendaftaran terbaru hari ini (limit 5).
 * Berguna untuk tabel "Recent Activities" di dashboard.
 */
const getRecentRegistrations = async (requestUser) => {
  const today = new Date().toISOString().split('T')[0];

  let doctorFilter = {};
  if (requestUser && requestUser.role === 'DOCTOR' && requestUser.doctorProfile) {
    doctorFilter = { doctor_id: requestUser.doctorProfile.id };
  }

  const recent = await Registration.findAll({
    where: { visit_date: today, ...doctorFilter },
    attributes: ['id', 'registration_number', 'status', 'created_at'],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'name', 'medical_record_number'],
      },
      {
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'name'],
      },
      {
        model: Policlinic,
        as: 'policlinic',
        attributes: ['id', 'name'],
      },
      {
        model: Queue,
        as: 'queue',
        attributes: ['queue_number'],
      },
      {
        model: Payment,
        as: 'payment',
        attributes: ['payment_status'],
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 5,
  });

  return recent.map((reg) => ({
    id: reg.id,
    registration_number: reg.registration_number,
    status: reg.status,
    patient_name: reg.patient?.name,
    doctor_name: reg.doctor?.name,
    policlinic_name: reg.policlinic?.name,
    queue_number: reg.queue?.queue_number,
    time: reg.created_at,
    payment: reg.payment ? { payment_status: reg.payment.payment_status } : null,
  }));
};

/**
 * Kombinasi semua data dashboard untuk 1 request.
 */
const getDashboardData = async (requestUser) => {
  const [metrics, trends, recent] = await Promise.all([
    getSummaryMetrics(requestUser),
    getVisitTrends(requestUser),
    getRecentRegistrations(requestUser),
  ]);

  return {
    metrics,
    trends,
    recent_registrations: recent,
  };
};

module.exports = {
  getSummaryMetrics,
  getVisitTrends,
  getRecentRegistrations,
  getDashboardData,
};
